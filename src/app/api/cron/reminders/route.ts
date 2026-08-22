import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReminderStatus } from "@/generated/prisma/enums";
import { sendReminder } from "@/lib/notifications/sendReminder";

/**
 * Processes any due, still-pending reminders — invoked every 5 minutes by
 * the `.github/workflows/reminders.yml` scheduled workflow, authenticated
 * via `x-cron-secret: <CRON_SECRET>`. See lib/notifications/sendReminder.ts.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid cron secret" } },
      { status: 401 }
    );
  }

  const dueReminders = await prisma.reminder.findMany({
    where: {
      status: ReminderStatus.PENDING,
      remindAt: { lte: new Date() },
      // Respect the user's Settings > Notifications toggle. Left PENDING
      // (not skipped forever) so re-enabling notifications later still
      // delivers it, just later than originally scheduled.
      user: { notificationsEnabled: true },
    },
    include: { task: true, user: true },
    take: 50,
  });

  const results = await Promise.allSettled(dueReminders.map(sendReminder));
  const sent = results.filter((r) => r.status === "fulfilled").length;

  return NextResponse.json({
    data: { processed: results.length, sent, failed: results.length - sent },
  });
}
