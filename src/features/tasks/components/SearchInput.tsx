"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/providers/I18nProvider";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

/** Instant, client-side search — no network round-trip, no page reload. */
export function SearchInput({ value, onChange }: SearchInputProps) {
  const { t } = useI18n();

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t.tasks.searchPlaceholder}
        aria-label={t.tasks.searchPlaceholder}
        className="pr-8 pl-8"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t.common.close}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
