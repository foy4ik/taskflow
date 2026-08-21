import { prisma } from "@/lib/prisma";
import { ReminderStatus } from "@/generated/prisma/enums";
import type { Reminder, Task, User } from "@/generated/prisma/client";

type ReminderWithRelations = Reminder & { task: Task; user: User };

/**
 * The extension point for real reminder delivery. Today this just logs and
 * marks the reminder SENT — wiring it up for real is:
 *   1. Call the Telegram Bot API: POST https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/sendMessage
 *      with { chat_id: user.telegramId, text: `Reminder: ${task.title}` }.
 *   2. Point a real scheduler (Vercel Cron, a hosted cron job, etc.) at
 *      POST /api/cron/reminders on an interval, authenticated with CRON_SECRET.
 * The data model (Reminder rows created/updated alongside Task.dueDate) and
 * the protected endpoint already exist — only the delivery call is a stub.
 */
export async function sendReminder(reminder: ReminderWithRelations): Promise<void> {
  try {
    console.log(
      `[reminder] Would notify Telegram user ${reminder.user.telegramId} about "${reminder.task.title}"`
    );

    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { status: ReminderStatus.SENT, sentAt: new Date() },
    });
  } catch (error) {
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { status: ReminderStatus.FAILED },
    });
    throw error;
  }
}
