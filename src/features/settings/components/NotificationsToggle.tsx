"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/providers/I18nProvider";

interface NotificationsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function NotificationsToggle({ checked, onChange, disabled }: NotificationsToggleProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor="notifications-toggle">{t.settings.notifications}</Label>
        <p className="text-xs text-muted-foreground">{t.settings.notificationsHint}</p>
      </div>
      <Switch
        id="notifications-toggle"
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
