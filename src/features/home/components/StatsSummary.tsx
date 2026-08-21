"use client";

import { ProgressBar } from "./ProgressBar";
import { useI18n } from "@/providers/I18nProvider";

interface StatsSummaryProps {
  total: number;
  completed: number;
  remaining: number;
}

export function StatsSummary({ total, completed, remaining }: StatsSummaryProps) {
  const { t } = useI18n();
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="mx-4 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-muted-foreground">{t.home.today}</p>
        <p className="text-sm font-medium text-foreground">{t.home.tasksLabel(total)}</p>
      </div>
      <ProgressBar value={percent} />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t.home.completedLabel(completed)}</span>
        <span>{t.home.remainingLabel(remaining)}</span>
      </div>
    </div>
  );
}
