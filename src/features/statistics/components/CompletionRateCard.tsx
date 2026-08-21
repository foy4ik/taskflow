"use client";

import { useI18n } from "@/providers/I18nProvider";

interface CompletionRateCardProps {
  completed: number;
  rate: number;
}

export function CompletionRateCard({ completed, rate }: CompletionRateCardProps) {
  const { t } = useI18n();

  return (
    <div className="mx-4 grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground">{t.statistics.completed}</p>
        <p className="text-2xl font-semibold text-foreground">{completed}</p>
      </div>
      <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground">{t.statistics.completionRate}</p>
        <p className="text-2xl font-semibold text-foreground">{rate}%</p>
      </div>
    </div>
  );
}
