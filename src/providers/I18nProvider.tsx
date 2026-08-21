"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { Locale } from "@/generated/prisma/enums";
import { en, type Dictionary } from "@/lib/i18n/en";
import { ru } from "@/lib/i18n/ru";
import { updateMe } from "@/services/api/me";
import type { PublicUser } from "@/types/user";

const STORAGE_KEY = "taskflow_locale";

const dictionaries: Record<Locale, Dictionary> = {
  [Locale.EN]: en,
  [Locale.RU]: ru,
};

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale, opts?: { persistRemote?: boolean }) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: Locale.EN,
  t: en,
  setLocale: () => {},
});

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

function detectBrowserLocale(): Locale {
  const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  const lang = tgLang ?? navigator.language;
  return lang?.toLowerCase().startsWith("ru") ? Locale.RU : Locale.EN;
}

/**
 * Resolves the starting locale once, synchronously, in the `useState`
 * initializer below — never in an effect. `I18nProvider` only ever mounts
 * client-side (it's nested under TelegramProvider's auth gate, which
 * withholds children until the session exists), so reading
 * `localStorage`/`window` here is safe despite this being a "pure" render.
 */
function resolveInitialLocale(queryClient: QueryClient): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === Locale.EN || stored === Locale.RU) return stored;
  const cachedUser = queryClient.getQueryData<PublicUser>(["me"]);
  return cachedUser?.locale ?? detectBrowserLocale();
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [locale, setLocaleState] = useState<Locale>(() => resolveInitialLocale(queryClient));

  const setLocale = useCallback((next: Locale, opts?: { persistRemote?: boolean }) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    if (opts?.persistRemote !== false) {
      updateMe({ locale: next }).catch(() => {
        // Non-fatal: the UI already reflects the new locale locally.
      });
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, t: dictionaries[locale], setLocale }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
