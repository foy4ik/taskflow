"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "../hooks/useCategories";
import { useCreateTask } from "../hooks/useCreateTask";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { useI18n } from "@/providers/I18nProvider";
import { useTelegramMainButton } from "@/hooks/useTelegramMainButton";
import { useTelegramBackButton } from "@/hooks/useTelegramBackButton";
import { Priority } from "@/generated/prisma/enums";
import type { Task } from "@/types/task";

const formSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(Priority),
  categoryId: z.string().min(1),
  date: z.string().optional(),
  time: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present -> editing that task. Absent -> creating a new one. */
  task?: Task | null;
}

function toFormDefaults(task?: Task | null): FormValues {
  if (!task) {
    return { title: "", description: "", priority: Priority.MEDIUM, categoryId: "", date: "", time: "" };
  }
  const due = task.dueDate ? new Date(task.dueDate) : null;
  return {
    title: task.title,
    description: task.description ?? "",
    priority: task.priority,
    categoryId: task.categoryId,
    date: due ? format(due, "yyyy-MM-dd") : "",
    time: due ? format(due, "HH:mm") : "",
  };
}

/** Shared create/edit form, rendered as a bottom Sheet. */
export function TaskFormSheet({ open, onOpenChange, task }: TaskFormSheetProps) {
  const { t } = useI18n();
  const isEdit = Boolean(task);
  const { data: categories } = useCategories();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isSaving = createTask.isPending || updateTask.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormDefaults(task),
  });

  useEffect(() => {
    if (open) reset(toFormDefaults(task));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task]);

  const categoryId = watch("categoryId");
  useEffect(() => {
    if (!isEdit && categories?.length && !categoryId) {
      setValue("categoryId", categories[0].id);
    }
  }, [categories, isEdit, categoryId, setValue]);

  const onSubmit = handleSubmit((values) => {
    const dueDate = values.date
      ? new Date(`${values.date}T${values.time || "09:00"}`).toISOString()
      : null;

    const payload = {
      title: values.title,
      description: values.description?.trim() ? values.description.trim() : null,
      priority: values.priority,
      categoryId: values.categoryId,
      dueDate,
    };

    if (isEdit && task) {
      updateTask.mutate({ id: task.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createTask.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  });

  useTelegramBackButton(() => onOpenChange(false), open);
  useTelegramMainButton({
    text: isEdit ? t.taskForm.submitEdit : t.taskForm.submitCreate,
    onClick: () => void onSubmit(),
    visible: open,
    disabled: isSaving,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{isEdit ? t.taskForm.editTitle : t.taskForm.createTitle}</SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">{t.taskForm.titleLabel}</Label>
            <Input
              id="task-title"
              placeholder={t.taskForm.titlePlaceholder}
              aria-invalid={Boolean(errors.title)}
              {...register("title")}
            />
            {errors.title ? (
              <p className="text-xs text-destructive">{t.taskForm.titleRequired}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">{t.taskForm.descriptionLabel}</Label>
            <Textarea
              id="task-description"
              placeholder={t.taskForm.descriptionPlaceholder}
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-date">{t.taskForm.dateLabel}</Label>
              <Input id="task-date" type="date" {...register("date")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-time">{t.taskForm.timeLabel}</Label>
              <Input id="task-time" type="time" {...register("time")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t.taskForm.priorityLabel}</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) =>
                          ({ LOW: t.priority.low, MEDIUM: t.priority.medium, HIGH: t.priority.high })[value] ??
                          value
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Priority.LOW}>{t.priority.low}</SelectItem>
                      <SelectItem value={Priority.MEDIUM}>{t.priority.medium}</SelectItem>
                      <SelectItem value={Priority.HIGH}>{t.priority.high}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t.taskForm.categoryLabel}</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full" aria-invalid={Boolean(errors.categoryId)}>
                      <SelectValue placeholder={t.taskForm.categoryLabel}>
                        {(value: string) => categories?.find((category) => category.id === value)?.name ?? value}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId ? (
                <p className="text-xs text-destructive">{t.taskForm.categoryRequired}</p>
              ) : null}
            </div>
          </div>
        </form>

        <SheetFooter>
          <Button onClick={() => void onSubmit()} disabled={isSaving} className="w-full">
            {isSaving ? t.common.saving : isEdit ? t.taskForm.submitEdit : t.taskForm.submitCreate}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
