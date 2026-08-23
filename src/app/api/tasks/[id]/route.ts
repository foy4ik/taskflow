import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/requireUser";
import { withErrorHandling, NotFoundError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { updateTaskSchema } from "@/lib/validation/task.schema";
import { TaskStatus } from "@/generated/prisma/enums";
import { syncReminder } from "@/lib/tasks/syncReminder";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  const userId = requireUserId(request);
  const { id } = await context.params;

  // Scoped by { id, userId } in one query — a mismatch looks identical to a
  // missing task (404), never revealing that another user's task exists.
  const task = await prisma.task.findFirst({
    where: { id, userId },
    include: { category: true, reminders: true },
  });
  if (!task) throw new NotFoundError("Task not found");

  return ok(task);
});

export const PATCH = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  const userId = requireUserId(request);
  const { id } = await context.params;
  const input = updateTaskSchema.parse(await request.json());

  if (input.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, OR: [{ userId }, { userId: null }] },
    });
    if (!category) throw new NotFoundError("Category not found");
  }

  const nextDueDate =
    input.dueDate === undefined ? undefined : input.dueDate ? new Date(input.dueDate) : null;

  const updated = await prisma.$transaction(async (tx) => {
    // updateMany scoped by { id, userId } is the atomic ownership check —
    // never fetch-then-check, which would leave a TOCTOU/leak window.
    const { count } = await tx.task.updateMany({
      where: { id, userId },
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        categoryId: input.categoryId,
        dueDate: nextDueDate,
        reminderOffset: input.reminderOffset,
        status: input.status,
        completedAt:
          input.status === undefined
            ? undefined
            : input.status === TaskStatus.COMPLETED
              ? new Date()
              : null,
      },
    });
    if (count === 0) return null;

    const task = await tx.task.findUniqueOrThrow({ where: { id } });
    // Recomputes from the task's current state regardless of which fields
    // this request touched — simpler than tracking every combination of
    // dueDate/reminderOffset/status changes, and just as correct: cancels
    // the reminder if now completed or due-date-less, otherwise replaces it
    // with one freshly computed from dueDate + reminderOffset.
    await syncReminder(tx, {
      id: task.id,
      userId,
      dueDate: task.dueDate,
      reminderOffset: task.reminderOffset,
      status: task.status,
    });

    return tx.task.findUnique({ where: { id }, include: { category: true } });
  });

  if (!updated) throw new NotFoundError("Task not found");
  return ok(updated);
});

export const DELETE = withErrorHandling(async (request: NextRequest, context: RouteContext) => {
  const userId = requireUserId(request);
  const { id } = await context.params;

  const result = await prisma.task.deleteMany({ where: { id, userId } });
  if (result.count === 0) throw new NotFoundError("Task not found");

  return ok({ id });
});
