"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMe } from "@/services/api/me";
import { ProfileCard } from "@/features/settings/components/ProfileCard";
import { ThemeSelector } from "@/features/settings/components/ThemeSelector";
import { NotificationsToggle } from "@/features/settings/components/NotificationsToggle";
import { TimezoneSelect } from "@/features/settings/components/TimezoneSelect";
import { LanguageSelect } from "@/features/settings/components/LanguageSelect";
import { useUpdateSettings } from "@/features/settings/hooks/useUpdateSettings";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/providers/ThemeProvider";
import { useI18n } from "@/providers/I18nProvider";

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const meQuery = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const updateSettings = useUpdateSettings();

  return (
    <div className="flex flex-col gap-4 pb-6">
      <h1 className="px-4 pt-6 text-xl font-semibold text-foreground">{t.settings.title}</h1>

      {meQuery.isLoading ? (
        <div className="flex flex-col gap-3 px-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      ) : meQuery.isError || !meQuery.data ? (
        <ErrorState onRetry={() => meQuery.refetch()} />
      ) : (
        <div className="flex flex-col gap-3 px-4">
          <ProfileCard />
          <ThemeSelector value={theme} onChange={setTheme} />
          <LanguageSelect value={locale} onChange={setLocale} />
          <NotificationsToggle
            checked={meQuery.data.notificationsEnabled}
            onChange={(checked) => updateSettings.mutate({ notificationsEnabled: checked })}
            disabled={updateSettings.isPending}
          />
          <TimezoneSelect
            value={meQuery.data.timezone}
            onChange={(value) => updateSettings.mutate({ timezone: value })}
            disabled={updateSettings.isPending}
          />
        </div>
      )}
    </div>
  );
}
