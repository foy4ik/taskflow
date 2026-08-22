import { prisma } from "@/lib/prisma";
import { ReminderStatus } from "@/generated/prisma/enums";
import type { Reminder, Task, User } from "@/generated/prisma/client";
import { sendTelegramMessage } from "@/lib/telegram/bot";

type ReminderWithRelations = Reminder & { task: Task; user: User };

/**
 * Delivers one due reminder as a Telegram message, with an inline button
 * that deep-links straight to the task. Called by POST /api/cron/reminders
 * for every PENDING reminder whose `remindAt` has passed.
 */
export async function sendReminder(reminder: ReminderWithRelations): Promise<void> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    await sendTelegramMessage({
      chatId: reminder.user.telegramId,
      text: `⏰ Напоминание: ${reminder.task.title}`,
      webAppButton: appUrl
        ? { text: "Открыть задачу", url: `${appUrl}/tasks/${reminder.task.id}` }
        : undefined,
    });

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
