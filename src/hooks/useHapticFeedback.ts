"use client";

import { useCallback, useMemo } from "react";
import { useTelegramWebApp } from "@/providers/TelegramProvider";

type NotificationType = "success" | "error" | "warning";
type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";

/**
 * Thin wrapper around Telegram's HapticFeedback API. A no-op outside
 * Telegram (webApp is null), so it's always safe to call. Used deliberately
 * and sparingly — see call sites: success on complete/create, error on
 * failed mutations, light selection on tab switches only.
 */
export function useHapticFeedback() {
  const { webApp } = useTelegramWebApp();

  const notify = useCallback(
    (type: NotificationType) => {
      webApp?.HapticFeedback?.notificationOccurred(type);
    },
    [webApp]
  );

  const impact = useCallback(
    (style: ImpactStyle = "light") => {
      webApp?.HapticFeedback?.impactOccurred(style);
    },
    [webApp]
  );

  const selection = useCallback(() => {
    webApp?.HapticFeedback?.selectionChanged();
  }, [webApp]);

  return useMemo(() => ({ notify, impact, selection }), [notify, impact, selection]);
}
