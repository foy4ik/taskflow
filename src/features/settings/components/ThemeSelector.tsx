"use client";

import { Sun, Moon, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/I18nProvider";
import { ThemePreference } from "@/generated/prisma/enums";

interface ThemeSelectorProps {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
}

const OPTIONS = [
  { value: ThemePreference.LIGHT, icon: Sun, labelKey: "themeLight" as const },
  { value: ThemePreference.DARK, icon: Moon, labelKey: "themeDark" as const },
  { value: ThemePreference.SYSTEM, icon: Smartphone, labelKey: "themeSystem" as const },
];

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
      <span className="text-sm font-medium text-foreground">{t.settings.theme}</span>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ value: optionValue, icon: Icon, labelKey }) => {
          const isActive = value === optionValue;
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(optionValue)}
              aria-pressed={isActive}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {t.settings[labelKey]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
