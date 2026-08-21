"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { Calendar, Check } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "./PriorityBadge";
import { CategoryBadge } from "./CategoryBadge";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { useI18n } from "@/providers/I18nProvider";
import { TaskStatus } from "@/generated/prisma/enums";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
}

export function TaskCard({ task, onSelect }: TaskCardProps) {
  const { t } = useI18n();
  const updateTask = useUpdateTask();
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = !isCompleted && dueDate ? isPast(dueDate) && !isToday(dueDate) : false;

  function handleToggle(event: MouseEvent) {
    event.stopPropagation();
    updateTask.mutate({
      id: task.id,
      payload: { status: isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED },
      silent: true,
    });
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(task);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(task)}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-xs transition-colors",
        "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isCompleted && "opacity-60"
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={isCompleted}
        aria-label={isCompleted ? t.taskDetail.reopen : t.taskDetail.complete}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isCompleted ? "border-primary bg-primary" : "border-muted-foreground/40 hover:border-primary"
        )}
      >
        {isCompleted ? <Check className="size-3 text-primary-foreground" aria-hidden="true" /> : null}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className={cn("text-sm font-medium text-foreground", isCompleted && "line-through")}>
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          <CategoryBadge category={task.category} />
          {dueDate ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                overdue
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-border text-muted-foreground"
              )}
            >
              <Calendar className="size-3" aria-hidden="true" />
              {format(dueDate, "MMM d, HH:mm")}
            </span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
