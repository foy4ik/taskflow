import { startOfDay, endOfDay, subDays, eachDayOfInterval, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/generated/prisma/enums";

export interface StatisticsResult {
  today: { total: number; completed: number; remaining: number };
  overall: { totalTasks: number; completedTasks: number; completionRate: number };
  byCategory: { categoryId: string; name: string; color: string | null; count: number }[];
  byDay: { date: string; completed: number; created: number }[];
}

export async function computeStatistics(
  userId: string,
  days = 7
): Promise<StatisticsResult> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const rangeStart = startOfDay(subDays(now, days - 1));

  const [todayTasks, allTasks, categoryGroups, categories, rangeTasks] =
    await Promise.all([
      prisma.task.findMany({
        where: { userId, dueDate: { gte: todayStart, lte: todayEnd } },
        select: { status: true },
      }),
      prisma.task.findMany({ where: { userId }, select: { status: true } }),
      prisma.task.groupBy({
        by: ["categoryId"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.category.findMany({ where: { OR: [{ userId }, { userId: null }] } }),
      prisma.task.findMany({
        where: {
          userId,
          OR: [{ createdAt: { gte: rangeStart } }, { completedAt: { gte: rangeStart } }],
        },
        select: { createdAt: true, completedAt: true },
      }),
    ]);

  const today = {
    total: todayTasks.length,
    completed: todayTasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
    remaining: todayTasks.filter((t) => t.status !== TaskStatus.COMPLETED).length,
  };

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const byCategory = categoryGroups
    .map((group) => {
      const category = categoryById.get(group.categoryId);
      return {
        categoryId: group.categoryId,
        name: category?.name ?? "Other",
        color: category?.color ?? null,
        count: group._count._all,
      };
    })
    .sort((a, b) => b.count - a.count);

  const byDay = eachDayOfInterval({ start: rangeStart, end: todayEnd }).map((date) => ({
    date: format(date, "yyyy-MM-dd"),
    completed: 0,
    created: 0,
  }));
  const bucketByDate = new Map(byDay.map((bucket) => [bucket.date, bucket]));

  for (const task of rangeTasks) {
    const createdBucket = bucketByDate.get(format(task.createdAt, "yyyy-MM-dd"));
    if (createdBucket) createdBucket.created += 1;

    if (task.completedAt) {
      const completedBucket = bucketByDate.get(format(task.completedAt, "yyyy-MM-dd"));
      if (completedBucket) completedBucket.completed += 1;
    }
  }

  return {
    today,
    overall: { totalTasks, completedTasks, completionRate },
    byCategory,
    byDay,
  };
}
