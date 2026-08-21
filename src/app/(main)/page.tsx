"use client";

import { useState } from "react";
import { PartyPopper } from "lucide-react";
import { Greeting } from "@/features/home/components/Greeting";
import { StatsSummary } from "@/features/home/components/StatsSummary";
import { TaskList } from "@/features/tasks/components/TaskList";
import { TaskDetailSheet } from "@/features/tasks/components/TaskDetailSheet";
import { TaskFormSheet } from "@/features/tasks/components/TaskFormSheet";
import { FAB } from "@/features/tasks/components/FAB";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonList } from "@/components/common/SkeletonList";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useStatistics } from "@/features/statistics/hooks/useStatistics";
import { useI18n } from "@/providers/I18nProvider";
import type { Task } from "@/types/task";

export default function HomePage() {
  const { t } = useI18n();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const tasksQuery = useTasks({ filter: "today", sort: "priority", order: "desc" });
  const statisticsQuery = useStatistics(7);

  return (
    <div className="flex flex-col gap-6 pb-6">
      <Greeting />

      {statisticsQuery.isLoading ? (
        <Skeleton className="mx-4 h-24 rounded-2xl" />
      ) : statisticsQuery.data ? (
        <StatsSummary
          total={statisticsQuery.data.today.total}
          completed={statisticsQuery.data.today.completed}
          remaining={statisticsQuery.data.today.remaining}
        />
      ) : null}

      <div className="flex flex-col gap-2">
        <h2 className="px-4 text-sm font-semibold text-foreground">{t.home.today}</h2>

        {tasksQuery.isLoading ? (
          <SkeletonList count={3} />
        ) : tasksQuery.isError ? (
          <ErrorState onRetry={() => tasksQuery.refetch()} />
        ) : tasksQuery.data && tasksQuery.data.data.length > 0 ? (
          <TaskList tasks={tasksQuery.data.data} onSelect={setSelectedTask} />
        ) : (
          <EmptyState
            icon={<PartyPopper className="size-10 text-primary" aria-hidden="true" />}
            title={t.home.emptyTitle}
            body={t.home.emptyBody}
          />
        )}
      </div>

      <FAB onClick={() => setCreateOpen(true)} />
      <TaskFormSheet open={createOpen} onOpenChange={setCreateOpen} />
      <TaskDetailSheet task={selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)} />
    </div>
  );
}
