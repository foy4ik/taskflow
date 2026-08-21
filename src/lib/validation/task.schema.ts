import { z } from "zod";
import { Priority, TaskStatus } from "@/generated/prisma/enums";

const isoDateTime = z.iso.datetime({ offset: true });

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).nullish(),
  priority: z.enum(Priority).default(Priority.MEDIUM),
  categoryId: z.string().min(1, "Category is required"),
  dueDate: isoDateTime.nullish(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).nullable(),
    priority: z.enum(Priority),
    categoryId: z.string().min(1),
    dueDate: isoDateTime.nullable(),
    status: z.enum(TaskStatus),
  })
  .partial();

export const taskFilterValues = [
  "all",
  "today",
  "upcoming",
  "overdue",
  "completed",
] as const;
export type TaskFilter = (typeof taskFilterValues)[number];

export const taskSortValues = ["dueDate", "priority", "createdAt"] as const;
export type TaskSort = (typeof taskSortValues)[number];

export const taskQuerySchema = z.object({
  filter: z.enum(taskFilterValues).default("all"),
  sort: z.enum(taskSortValues).default("dueDate"),
  order: z.enum(["asc", "desc"]).default("asc"),
  search: z.string().trim().max(200).optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
