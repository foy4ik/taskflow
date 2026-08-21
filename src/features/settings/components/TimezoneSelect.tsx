"use client";

import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/providers/I18nProvider";

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const FALLBACK_TIMEZONES = [
  "UTC",
  "Europe/Moscow",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function getTimezones(): string[] {
  if (typeof Intl.supportedValuesOf === "function") {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      // fall through to the curated fallback list below
    }
  }
  return FALLBACK_TIMEZONES;
}

export function TimezoneSelect({ value, onChange, disabled }: TimezoneSelectProps) {
  const { t } = useI18n();
  const timezones = useMemo(() => getTimezones(), []);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="text-sm font-medium text-foreground">{t.settings.timezone}</span>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next);
        }}
        disabled={disabled}
      >
        <SelectTrigger className="max-w-[60%]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {timezones.map((timezone) => (
            <SelectItem key={timezone} value={timezone}>
              {timezone}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
