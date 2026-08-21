import type { Priority, TaskStatus } from "@/generated/prisma/enums";

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  userId: string | null;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  categoryId: string;
  category: Category;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  priority: Priority;
  categoryId: string;
  dueDate?: string | null;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload> & { status?: TaskStatus };

export type TaskFilter = "all" | "today" | "upcoming" | "overdue" | "completed";
export type TaskSort = "dueDate" | "priority" | "createdAt";
export type SortOrder = "asc" | "desc";

export interface TaskQueryParams {
  filter?: TaskFilter;
  sort?: TaskSort;
  order?: SortOrder;
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}
