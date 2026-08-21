"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { TelegramProvider } from "./TelegramProvider";
import { ThemeProvider } from "./ThemeProvider";
import { I18nProvider } from "./I18nProvider";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <TelegramProvider>
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster position="top-center" />
          </I18nProvider>
        </ThemeProvider>
      </TelegramProvider>
    </QueryProvider>
  );
}
