import { startOfDay, endOfDay } from "date-fns";
import type { Prisma } from "@/generated/prisma/client";
import { TaskStatus } from "@/generated/prisma/enums";
import type { TaskFilter, TaskSort } from "@/lib/validation/task.schema";

/**
 * Builds the Prisma `where` clause for a task list filter. Date buckets
 * (today/upcoming/overdue) are computed against the server's current UTC
 * time — a deliberate simplification; per-user-timezone bucketing (using
 * User.timezone) would need real calendar-day math for each zone and isn't
 * worth the complexity for a personal task manager at this scope.
 */
export function buildTaskWhere(params: {
  userId: string;
  filter: TaskFilter;
  categoryId?: string;
  search?: string;
}): Prisma.TaskWhereInput {
  const { userId, filter, categoryId, search } = params;
  const now = new Date();

  const where: Prisma.TaskWhereInput = { userId };

  if (categoryId) where.categoryId = categoryId;
  if (search) where.title = { contains: search, mode: "insensitive" };

  switch (filter) {
    case "today":
      where.status = TaskStatus.PENDING;
      where.dueDate = { gte: startOfDay(now), lte: endOfDay(now) };
      break;
    case "upcoming":
      where.status = TaskStatus.PENDING;
      where.dueDate = { gt: endOfDay(now) };
      break;
    case "overdue":
      where.status = TaskStatus.PENDING;
      where.dueDate = { lt: startOfDay(now) };
      break;
    case "completed":
      where.status = TaskStatus.COMPLETED;
      break;
    case "all":
    default:
      break;
  }

  return where;
}

/**
 * Postgres enums compare by declaration order, and `Priority` is declared
 * LOW < MEDIUM < HIGH in schema.prisma — so ordering by the enum column
 * directly already ranks by severity, no numeric mapping needed.
 */
export function buildTaskOrderBy(
  sort: TaskSort,
  order: "asc" | "desc"
): Prisma.TaskOrderByWithRelationInput[] {
  switch (sort) {
    case "priority":
      return [{ priority: order }, { dueDate: { sort: "asc", nulls: "last" } }];
    case "createdAt":
      return [{ createdAt: order }];
    case "dueDate":
    default:
      return [{ dueDate: { sort: order, nulls: "last" } }, { createdAt: "asc" }];
  }
}
