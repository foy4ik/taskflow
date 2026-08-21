"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/providers/I18nProvider";
import type { TaskFilter } from "@/types/task";

const FILTERS: TaskFilter[] = ["all", "today", "upcoming", "overdue", "completed"];

interface FilterTabsProps {
  value: TaskFilter;
  onChange: (filter: TaskFilter) => void;
}

export function FilterTabs({ value, onChange }: FilterTabsProps) {
  const { t } = useI18n();

  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as TaskFilter)}>
      <TabsList className="w-full flex-wrap justify-start gap-1 bg-transparent p-0">
        {FILTERS.map((filter) => (
          <TabsTrigger key={filter} value={filter} className="rounded-full border border-border px-3 py-1">
            {t.tasks.filters[filter]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
