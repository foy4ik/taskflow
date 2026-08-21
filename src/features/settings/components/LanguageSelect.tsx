"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/I18nProvider";
import { Locale } from "@/generated/prisma/enums";

interface LanguageSelectProps {
  value: Locale;
  onChange: (value: Locale) => void;
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  const { t } = useI18n();
  const options = [
    { value: Locale.EN, label: t.settings.languageEn },
    { value: Locale.RU, label: t.settings.languageRu },
  ];

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
      <span className="text-sm font-medium text-foreground">{t.settings.language}</span>
      <div className="flex gap-1 rounded-full bg-muted p-1">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
