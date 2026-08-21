import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "./PriorityBadge";
import { CategoryBadge } from "./CategoryBadge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/providers/I18nProvider";
import { TaskStatus } from "@/generated/prisma/enums";
import type { Task } from "@/types/task";

interface TaskDetailContentProps {
  task: Task;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isMutating?: boolean;
}

/** Pure presentational detail view — shared by the bottom-sheet and the /tasks/[id] page. */
export function TaskDetailContent({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  isMutating,
}: TaskDetailContentProps) {
  const { t } = useI18n();
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;

  return (
    <div className="flex flex-col gap-5 px-4 pb-6">
      <div className="flex flex-col gap-2">
        <h2
          className={cn(
            "text-lg font-semibold text-foreground",
            isCompleted && "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          <CategoryBadge category={task.category} />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {dueDate ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" aria-hidden="true" />
              {format(dueDate, "EEEE, MMM d")}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden="true" />
              {format(dueDate, "HH:mm")}
            </span>
          </div>
        ) : (
          <p>{t.taskDetail.noDueDate}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t.taskForm.descriptionLabel}
        </p>
        <p className="text-sm whitespace-pre-wrap text-foreground">
          {task.description || t.taskDetail.noDescription}
        </p>
      </div>

      {isCompleted && task.completedAt ? (
        <p className="text-xs text-muted-foreground">
          {t.taskDetail.completedOn(format(new Date(task.completedAt), "MMM d, HH:mm"))}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 pt-2">
        <Button onClick={onToggleComplete} disabled={isMutating} variant={isCompleted ? "outline" : "default"}>
          {isCompleted ? t.taskDetail.reopen : t.taskDetail.complete}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onEdit} disabled={isMutating}>
            {t.taskDetail.edit}
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isMutating}>
            {t.taskDetail.delete}
          </Button>
        </div>
      </div>
    </div>
  );
}
