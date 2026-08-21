"use client";

import { BarChart3 } from "lucide-react";
import { CompletionRateCard } from "@/features/statistics/components/CompletionRateCard";
import { StatisticsChart } from "@/features/statistics/components/StatisticsChart";
import { CategoryBreakdown } from "@/features/statistics/components/CategoryBreakdown";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useStatistics } from "@/features/statistics/hooks/useStatistics";
import { useI18n } from "@/providers/I18nProvider";

export default function StatisticsPage() {
  const { t } = useI18n();
  const statisticsQuery = useStatistics(7);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <h1 className="px-4 pt-6 text-xl font-semibold text-foreground">{t.statistics.title}</h1>

      {statisticsQuery.isLoading ? (
        <div className="flex flex-col gap-4 px-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : statisticsQuery.isError ? (
        <ErrorState onRetry={() => statisticsQuery.refetch()} />
      ) : statisticsQuery.data && statisticsQuery.data.overall.totalTasks > 0 ? (
        <>
          <CompletionRateCard
            completed={statisticsQuery.data.overall.completedTasks}
            rate={statisticsQuery.data.overall.completionRate}
          />
          <StatisticsChart data={statisticsQuery.data.byDay} />
          {statisticsQuery.data.byCategory.length > 0 ? (
            <CategoryBreakdown items={statisticsQuery.data.byCategory} />
          ) : null}
        </>
      ) : (
        <EmptyState
          icon={<BarChart3 className="size-10 text-muted-foreground" aria-hidden="true" />}
          title={t.statistics.noData}
        />
      )}
    </div>
  );
}
