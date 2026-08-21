"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { TelegramWebApp } from "@/types/telegram";
import type { PublicUser } from "@/types/user";
import { authenticateWithMock, authenticateWithTelegram } from "@/services/api/me";
import { setUnauthorizedHandler } from "@/services/api/client";

type AuthStatus = "loading" | "ready" | "error";

interface TelegramContextValue {
  webApp: TelegramWebApp | null;
  isTelegramEnvironment: boolean;
  user: PublicUser | null;
}

const TelegramContext = createContext<TelegramContextValue>({
  webApp: null,
  isTelegramEnvironment: false,
  user: null,
});

export function useTelegramWebApp(): TelegramContextValue {
  return useContext(TelegramContext);
}

/**
 * Establishes the app session before anything else renders: loads Telegram's
 * own `telegram-web-app.js`, calls `ready()`/`expand()`, then POSTs
 * `initData` to /api/auth/telegram for server-side verification. Falls back
 * to the dev mock-auth path (still server-gated) when there's no Telegram
 * context at all — e.g. testing in a plain browser. Children only render
 * once a session cookie is established, so every other query/mutation in
 * the app can assume it's authenticated.
 */
export function TelegramProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const authenticate = useCallback(async () => {
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
    const authedUser = tg?.initData
      ? await authenticateWithTelegram(tg.initData)
      : await authenticateWithMock();
    setUser(authedUser);
    queryClient.setQueryData(["me"], authedUser);
  }, [queryClient]);

  // Let the API client silently re-auth + retry once on a 401 (expired
  // session), instead of surfacing an error the user can't do anything about.
  useEffect(() => {
    setUnauthorizedHandler(authenticate);
    return () => setUnauthorizedHandler(null);
  }, [authenticate]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const tg = window.Telegram?.WebApp ?? null;
      if (tg) {
        tg.ready();
        tg.expand();
        setWebApp(tg);
      }

      try {
        await authenticate();
        if (!cancelled) setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to sign in");
          setStatus("error");
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
    // Runs once on mount — `authenticate` is stable enough for our purposes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<TelegramContextValue>(
    () => ({ webApp, isTelegramEnvironment: Boolean(webApp), user }),
    [webApp, user]
  );

  return (
    <TelegramContext.Provider value={value}>
      {status === "loading" ? (
        <AuthSplash />
      ) : status === "error" ? (
        <AuthErrorScreen
          message={errorMessage}
          onRetry={() => {
            setStatus("loading");
            setErrorMessage(null);
            authenticate()
              .then(() => setStatus("ready"))
              .catch((error) => {
                setErrorMessage(error instanceof Error ? error.message : "Failed to sign in");
                setStatus("error");
              });
          }}
        />
      ) : (
        children
      )}
    </TelegramContext.Provider>
  );
}

function AuthSplash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div
        className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

function AuthErrorScreen({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <p className="text-lg font-medium text-foreground">Couldn&apos;t sign you in</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        {message ?? "Something went wrong while connecting to Telegram."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Try again
      </button>
    </div>
  );
}
