"use client";

import { useI18n } from "@/providers/I18nProvider";
import type { StatisticsResponse } from "@/types/statistics";

interface CategoryBreakdownProps {
  items: StatisticsResponse["byCategory"];
}

export function CategoryBreakdown({ items }: CategoryBreakdownProps) {
  const { t } = useI18n();
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="mx-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">{t.statistics.byCategory}</p>
      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          const percent = total === 0 ? 0 : Math.round((item.count / total) * 100);
          return (
            <div key={item.categoryId} className="flex items-center gap-3">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color ?? "var(--muted-foreground)" }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.name}</span>
              <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: item.color ?? "var(--primary)",
                  }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">{item.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
