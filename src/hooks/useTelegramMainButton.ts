"use client";

import { useEffect } from "react";
import { useTelegramWebApp } from "@/providers/TelegramProvider";

interface UseTelegramMainButtonOptions {
  text: string;
  onClick: () => void;
  visible: boolean;
  disabled?: boolean;
}

/** Mirrors a sheet's primary submit action onto Telegram's native MainButton. */
export function useTelegramMainButton({ text, onClick, visible, disabled }: UseTelegramMainButtonOptions) {
  const { webApp } = useTelegramWebApp();

  useEffect(() => {
    if (!webApp) return undefined;
    const button = webApp.MainButton;

    button.setText(text);
    button.onClick(onClick);
    if (disabled) button.disable();
    else button.enable();
    if (visible) button.show();
    else button.hide();

    return () => {
      button.offClick(onClick);
      button.hide();
    };
  }, [webApp, text, onClick, visible, disabled]);
}
