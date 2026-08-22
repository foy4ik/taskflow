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
      {/* !h-auto overrides TabsList's default fixed h-8 (sized for a single
          row) — plain h-auto loses the cascade to the component's own
          group-data-horizontal:h-8 rule, so a wrapped second row of tabs
          overflows the container and overlaps whatever renders after it
          (the sort menu). Needs !important to actually win. */}
      <TabsList className="!h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
        {FILTERS.map((filter) => (
          <TabsTrigger
            key={filter}
            value={filter}
            className="h-auto rounded-full border border-border px-3 py-1"
          >
            {t.tasks.filters[filter]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
