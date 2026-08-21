"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { ThemePreference } from "@/generated/prisma/enums";
import { useTelegramWebApp } from "./TelegramProvider";
import { updateMe } from "@/services/api/me";
import type { PublicUser } from "@/types/user";
import type { TelegramWebApp } from "@/types/telegram";

const STORAGE_KEY = "taskflow_theme";

const TELEGRAM_VAR_MAP: Record<string, string> = {
  bg_color: "--background",
  text_color: "--foreground",
  hint_color: "--muted-foreground",
  link_color: "--primary",
  button_color: "--primary",
  button_text_color: "--primary-foreground",
  secondary_bg_color: "--card",
};

function applyTelegramThemeVars(themeParams: Record<string, string | undefined>) {
  const root = document.documentElement;
  for (const [tgKey, cssVar] of Object.entries(TELEGRAM_VAR_MAP)) {
    const value = themeParams[tgKey];
    if (value) root.style.setProperty(cssVar, value);
  }
}

function clearTelegramThemeVars() {
  const root = document.documentElement;
  for (const cssVar of Object.values(TELEGRAM_VAR_MAP)) {
    root.style.removeProperty(cssVar);
  }
}

// The OS/browser's own color-scheme preference, as a real external store —
// used only as SYSTEM's fallback when there's no Telegram context.
function subscribeToSystemScheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function getSystemSchemeSnapshot(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function getSystemSchemeServerSnapshot(): "light" | "dark" {
  return "light";
}

// Telegram's theme is also read as an external store: `webApp` is a mutable
// singleton object whose `colorScheme`/`themeParams` change in place, so a
// plain prop/ref read wouldn't re-render on Telegram's own `themeChanged`
// event without this subscription.
function getTelegramThemeSnapshot(webApp: TelegramWebApp | null): string {
  if (!webApp) return "no-telegram";
  return `${webApp.colorScheme}|${JSON.stringify(webApp.themeParams)}`;
}

function resolveInitialTheme(queryClient: QueryClient): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (Object.values(ThemePreference) as string[]).includes(stored)) {
    return stored as ThemePreference;
  }
  const cachedUser = queryClient.getQueryData<PublicUser>(["me"]);
  return cachedUser?.theme ?? ThemePreference.SYSTEM;
}

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedScheme: "light" | "dark";
  setTheme: (theme: ThemePreference, opts?: { persistRemote?: boolean }) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: ThemePreference.SYSTEM,
  resolvedScheme: "light",
  setTheme: () => {},
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/**
 * Three-way theme: LIGHT / DARK are a normal Tailwind `.dark` class toggle.
 * SYSTEM ("System / Telegram") instead live-maps Telegram's `themeParams`
 * onto our CSS variables and follows `colorScheme`, so the UI visually
 * matches whatever theme the user has set in Telegram itself. Outside
 * Telegram, SYSTEM falls back to `prefers-color-scheme`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { webApp } = useTelegramWebApp();
  const queryClient = useQueryClient();
  const [theme, setThemeState] = useState<ThemePreference>(() => resolveInitialTheme(queryClient));

  const systemScheme = useSyncExternalStore(
    subscribeToSystemScheme,
    getSystemSchemeSnapshot,
    getSystemSchemeServerSnapshot
  );
  // Forces a re-render whenever Telegram fires `themeChanged`; the actual
  // values are read straight off `webApp` below.
  useSyncExternalStore(
    (callback) => {
      if (!webApp) return () => {};
      webApp.onEvent("themeChanged", callback);
      return () => webApp.offEvent("themeChanged", callback);
    },
    () => getTelegramThemeSnapshot(webApp),
    () => "no-telegram"
  );

  const resolvedScheme: "light" | "dark" = useMemo(() => {
    if (theme === ThemePreference.SYSTEM) {
      return webApp ? (webApp.colorScheme ?? "light") : systemScheme;
    }
    return theme === ThemePreference.DARK ? "dark" : "light";
  }, [theme, webApp, systemScheme]);

  // Pure "sync external system" effect — reacts to already-computed state,
  // never calls setState itself.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === ThemePreference.SYSTEM && webApp) {
      applyTelegramThemeVars(webApp.themeParams as unknown as Record<string, string | undefined>);
    } else {
      clearTelegramThemeVars();
    }
    root.classList.toggle("dark", resolvedScheme === "dark");
  }, [theme, webApp, resolvedScheme]);

  const setTheme = useCallback((next: ThemePreference, opts?: { persistRemote?: boolean }) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    if (opts?.persistRemote !== false) {
      updateMe({ theme: next }).catch(() => {
        // Non-fatal: the UI already reflects the new theme locally.
      });
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedScheme, setTheme }),
    [theme, resolvedScheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
