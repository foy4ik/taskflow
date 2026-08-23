import type { Prisma } from "@/generated/prisma/client";
import { ReminderStatus, TaskStatus, type ReminderOffset } from "@/generated/prisma/enums";
import { computeRemindAt } from "./reminderOffset";

interface TaskReminderState {
  id: string;
  userId: string;
  dueDate: Date | null;
  reminderOffset: ReminderOffset;
  status: TaskStatus;
}

/**
 * Keeps the Reminder table in sync with a Task's current dueDate/offset/
 * status. Called after every create/update inside the same transaction.
 * Idempotent: cancels whatever PENDING reminder currently exists, then
 * creates a fresh one if the task still needs one — simpler and more
 * robust than trying to diff what changed.
 */
export async function syncReminder(tx: Prisma.TransactionClient, task: TaskReminderState): Promise<void> {
  await tx.reminder.updateMany({
    where: { taskId: task.id, status: ReminderStatus.PENDING },
    data: { status: ReminderStatus.CANCELLED },
  });

  if (task.status === TaskStatus.COMPLETED || !task.dueDate) return;

  await tx.reminder.create({
    data: {
      taskId: task.id,
      userId: task.userId,
      remindAt: computeRemindAt(task.dueDate, task.reminderOffset),
    },
  });
}
