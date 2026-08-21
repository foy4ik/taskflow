"use client";

import { Suspense, useMemo, useState } from "react";
import { ListChecks } from "lucide-react";
import { FilterTabs } from "@/features/tasks/components/FilterTabs";
import { SortMenu } from "@/features/tasks/components/SortMenu";
import { SearchInput } from "@/features/tasks/components/SearchInput";
import { TaskList } from "@/features/tasks/components/TaskList";
import { TaskDetailSheet } from "@/features/tasks/components/TaskDetailSheet";
import { TaskFormSheet } from "@/features/tasks/components/TaskFormSheet";
import { FAB } from "@/features/tasks/components/FAB";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonList } from "@/components/common/SkeletonList";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useTaskFilters } from "@/features/tasks/hooks/useTaskFilters";
import { matchesSearch } from "@/features/tasks/utils/taskFilters";
import { useI18n } from "@/providers/I18nProvider";
import type { Task } from "@/types/task";

function TasksPageContent() {
  const { t } = useI18n();
  const { filter, sort, order, search, setFilters } = useTaskFilters();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const tasksQuery = useTasks({ filter, sort, order });

  const filteredTasks = useMemo(() => {
    if (!tasksQuery.data) return [];
    return tasksQuery.data.data.filter((task) => matchesSearch(task, search));
  }, [tasksQuery.data, search]);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex flex-col gap-3 px-4 pt-6">
        <h1 className="text-xl font-semibold text-foreground">{t.tasks.title}</h1>
        <SearchInput value={search} onChange={(value) => setFilters({ search: value })} />
        <FilterTabs value={filter} onChange={(next) => setFilters({ filter: next })} />
        <div className="flex justify-end">
          <SortMenu
            sort={sort}
            order={order}
            onChange={({ sort: nextSort, order: nextOrder }) =>
              setFilters({ sort: nextSort, order: nextOrder })
            }
          />
        </div>
      </div>

      {tasksQuery.isLoading ? (
        <SkeletonList count={5} />
      ) : tasksQuery.isError ? (
        <ErrorState onRetry={() => tasksQuery.refetch()} />
      ) : filteredTasks.length > 0 ? (
        <TaskList tasks={filteredTasks} onSelect={setSelectedTask} />
      ) : search ? (
        <EmptyState
          icon={<ListChecks className="size-10 text-muted-foreground" aria-hidden="true" />}
          title={t.tasks.noResults(search)}
        />
      ) : (
        <EmptyState
          icon={<ListChecks className="size-10 text-muted-foreground" aria-hidden="true" />}
          title={t.tasks.emptyTitle}
          body={t.tasks.emptyBody}
        />
      )}

      <FAB onClick={() => setCreateOpen(true)} />
      <TaskFormSheet open={createOpen} onOpenChange={setCreateOpen} />
      <TaskDetailSheet task={selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)} />
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<SkeletonList count={5} />}>
      <TasksPageContent />
    </Suspense>
  );
}
