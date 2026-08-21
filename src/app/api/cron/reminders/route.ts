import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReminderStatus } from "@/generated/prisma/enums";
import { sendReminder } from "@/lib/notifications/sendReminder";

/**
 * Extension-point endpoint: processes any due, still-pending reminders.
 * Not wired to a live scheduler in this build — intended to be invoked by a
 * real cron trigger (Vercel Cron, GitHub Actions schedule, etc.) with
 * `x-cron-secret: <CRON_SECRET>`. See lib/notifications/sendReminder.ts.
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
    where: { status: ReminderStatus.PENDING, remindAt: { lte: new Date() } },
    include: { task: true, user: true },
    take: 50,
  });

  const results = await Promise.allSettled(dueReminders.map(sendReminder));
  const sent = results.filter((r) => r.status === "fulfilled").length;

  return NextResponse.json({
    data: { processed: results.length, sent, failed: results.length - sent },
  });
}
