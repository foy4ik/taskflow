"use client";

import { useI18n } from "@/providers/I18nProvider";
import { useTelegramWebApp } from "@/providers/TelegramProvider";

function getGreetingKey(hour: number): "greetingMorning" | "greetingAfternoon" | "greetingEvening" {
  if (hour < 12) return "greetingMorning";
  if (hour < 18) return "greetingAfternoon";
  return "greetingEvening";
}

export function Greeting() {
  const { t } = useI18n();
  const { user } = useTelegramWebApp();
  const greeting = t.home[getGreetingKey(new Date().getHours())];

  return (
    <div className="flex flex-col gap-0.5 px-4 pt-6">
      <p className="text-sm text-muted-foreground">{greeting} 👋</p>
      <h1 className="text-2xl font-semibold text-foreground">{user?.firstName ?? "…"}</h1>
    </div>
  );
}
