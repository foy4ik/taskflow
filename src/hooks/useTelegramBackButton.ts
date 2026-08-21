"use client";

import { useEffect } from "react";
import { useTelegramWebApp } from "@/providers/TelegramProvider";

/** Wires Telegram's native BackButton to close whichever sheet/page is open. */
export function useTelegramBackButton(onBack: () => void, enabled: boolean) {
  const { webApp } = useTelegramWebApp();

  useEffect(() => {
    if (!webApp || !enabled) return undefined;
    const button = webApp.BackButton;
    button.onClick(onBack);
    button.show();

    return () => {
      button.offClick(onBack);
      button.hide();
    };
  }, [webApp, enabled, onBack]);
}
