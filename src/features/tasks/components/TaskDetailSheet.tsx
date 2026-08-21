"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TaskDetailContent } from "./TaskDetailContent";
import { TaskFormSheet } from "./TaskFormSheet";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useTask } from "../hooks/useTask";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { useDeleteTask } from "../hooks/useDeleteTask";
import { useTelegramBackButton } from "@/hooks/useTelegramBackButton";
import { useI18n } from "@/providers/I18nProvider";
import { TaskStatus } from "@/generated/prisma/enums";
import type { Task } from "@/types/task";

interface TaskDetailSheetProps {
  /** The task snapshot as of when it was opened (e.g. the tapped card) — used as the id source and as `initialData`. */
  task: Task | null;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({ task: initialTask, onOpenChange }: TaskDetailSheetProps) {
  const { t } = useI18n();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  // Subscribes to the same ["task", id] cache entry mutations write to, so
  // toggling complete/editing is reflected here immediately instead of
  // freezing on the snapshot the sheet was opened with.
  const { data: task } = useTask(initialTask?.id, initialTask ?? undefined);

  // Only one sheet is visible at a time: the edit form takes over while open.
  const open = Boolean(initialTask) && !editOpen;
  useTelegramBackButton(() => onOpenChange(false), open);

  if (!initialTask || !task) return null;

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) onOpenChange(false);
        }}
      >
        <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{t.taskDetail.title}</SheetTitle>
          </SheetHeader>
          <TaskDetailContent
            task={task}
            isMutating={updateTask.isPending || deleteTask.isPending}
            onToggleComplete={() =>
              updateTask.mutate({
                id: task.id,
                payload: {
                  status:
                    task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED,
                },
              })
            }
            onEdit={() => setEditOpen(true)}
            onDelete={() => setConfirmDeleteOpen(true)}
          />
        </SheetContent>
      </Sheet>

      <TaskFormSheet open={editOpen} onOpenChange={setEditOpen} task={task} />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={t.taskDetail.deleteConfirmTitle}
        description={t.taskDetail.deleteConfirmBody}
        confirmLabel={t.taskDetail.deleteConfirmAction}
        destructive
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          deleteTask.mutate(task.id, { onSuccess: () => onOpenChange(false) });
        }}
      />
    </>
  );
}
