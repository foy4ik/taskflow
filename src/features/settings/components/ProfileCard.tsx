"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTelegramWebApp } from "@/providers/TelegramProvider";
import { useI18n } from "@/providers/I18nProvider";

export function ProfileCard() {
  const { user } = useTelegramWebApp();
  const { t } = useI18n();

  if (!user) return null;

  const initials = `${user.firstName[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <Avatar size="lg">
        {user.photoUrl ? <AvatarImage src={user.photoUrl} alt="" /> : null}
        <AvatarFallback>{initials || "?"}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <p className="truncate text-sm font-semibold text-foreground">
          {user.firstName} {user.lastName ?? ""}
        </p>
        {user.username ? (
          <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
        ) : (
          <p className="truncate text-xs text-muted-foreground">{t.settings.profile}</p>
        )}
      </div>
    </div>
  );
}
