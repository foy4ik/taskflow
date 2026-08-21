"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskDetailContent } from "@/features/tasks/components/TaskDetailContent";
import { TaskFormSheet } from "@/features/tasks/components/TaskFormSheet";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonList } from "@/components/common/SkeletonList";
import { useTask } from "@/features/tasks/hooks/useTask";
import { useUpdateTask } from "@/features/tasks/hooks/useUpdateTask";
import { useDeleteTask } from "@/features/tasks/hooks/useDeleteTask";
import { useTelegramBackButton } from "@/hooks/useTelegramBackButton";
import { useI18n } from "@/providers/I18nProvider";
import { TaskStatus } from "@/generated/prisma/enums";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useI18n();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const taskQuery = useTask(id);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const goBack = () => router.push("/tasks");
  useTelegramBackButton(goBack, !editOpen);

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex items-center gap-2 px-4 pt-6">
        <Button variant="ghost" size="icon" onClick={goBack} aria-label={t.common.back}>
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">{t.taskDetail.title}</h1>
      </div>

      {taskQuery.isLoading ? (
        <SkeletonList count={1} />
      ) : taskQuery.isError || !taskQuery.data ? (
        <ErrorState onRetry={() => taskQuery.refetch()} />
      ) : (
        <TaskDetailContent
          task={taskQuery.data}
          isMutating={updateTask.isPending || deleteTask.isPending}
          onToggleComplete={() =>
            updateTask.mutate({
              id,
              payload: {
                status:
                  taskQuery.data.status === TaskStatus.COMPLETED
                    ? TaskStatus.PENDING
                    : TaskStatus.COMPLETED,
              },
            })
          }
          onEdit={() => setEditOpen(true)}
          onDelete={() => setConfirmDeleteOpen(true)}
        />
      )}

      {taskQuery.data ? (
        <TaskFormSheet open={editOpen} onOpenChange={setEditOpen} task={taskQuery.data} />
      ) : null}

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={t.taskDetail.deleteConfirmTitle}
        description={t.taskDetail.deleteConfirmBody}
        confirmLabel={t.taskDetail.deleteConfirmAction}
        destructive
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          deleteTask.mutate(id, { onSuccess: goBack });
        }}
      />
    </div>
  );
}
