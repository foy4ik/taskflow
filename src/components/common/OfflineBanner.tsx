"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useI18n } from "@/providers/I18nProvider";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { t } = useI18n();

  if (isOnline) return null;

  return (
    <div
      className="flex items-center gap-2 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive"
      role="status"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden="true" />
      <span>
        {t.states.offlineTitle} — {t.states.offlineBody}
      </span>
    </div>
  );
}
