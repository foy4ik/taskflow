import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/requireUser";
import { withErrorHandling, NotFoundError } from "@/lib/api/errors";
import { ok, okWithMeta } from "@/lib/api/response";
import { createTaskSchema, taskQuerySchema } from "@/lib/validation/task.schema";
import { buildTaskWhere, buildTaskOrderBy } from "@/lib/tasks/queryHelpers";
import { syncReminder } from "@/lib/tasks/syncReminder";
import { TaskStatus } from "@/generated/prisma/enums";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = requireUserId(request);
  const query = taskQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  const where = buildTaskWhere({
    userId,
    filter: query.filter,
    categoryId: query.categoryId,
    search: query.search,
  });
  const orderBy = buildTaskOrderBy(query.sort, query.order);

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      include: { category: true },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.task.count({ where }),
  ]);

  return okWithMeta(tasks, {
    total,
    page: query.page,
    limit: query.limit,
    hasMore: query.page * query.limit < total,
  });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const userId = requireUserId(request);
  const input = createTaskSchema.parse(await request.json());

  // The category must be a shared default (userId: null) or actually belong
  // to this user — never trust categoryId as proof it's usable.
  const category = await prisma.category.findFirst({
    where: { id: input.categoryId, OR: [{ userId }, { userId: null }] },
  });
  if (!category) throw new NotFoundError("Category not found");

  const dueDate = input.dueDate ? new Date(input.dueDate) : null;

  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        userId,
        title: input.title,
        description: input.description ?? null,
        priority: input.priority,
        categoryId: input.categoryId,
        dueDate,
        reminderOffset: input.reminderOffset,
      },
      include: { category: true },
    });

    await syncReminder(tx, {
      id: created.id,
      userId,
      dueDate: created.dueDate,
      reminderOffset: created.reminderOffset,
      status: TaskStatus.PENDING,
    });

    return created;
  });

  return ok(task, 201);
});
