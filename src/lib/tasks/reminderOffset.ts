import { ReminderOffset } from "@/generated/prisma/enums";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const OFFSET_BEFORE_MS: Record<Exclude<ReminderOffset, "NONE">, number> = {
  [ReminderOffset.AT_TIME]: 0,
  [ReminderOffset.THIRTY_MIN_BEFORE]: 30 * MINUTE_MS,
  [ReminderOffset.ONE_HOUR_BEFORE]: HOUR_MS,
  [ReminderOffset.ONE_DAY_BEFORE]: DAY_MS,
};

/**
 * NONE isn't "never remind" — it's a 1-hour-after-the-fact nudge, sent only
 * if the task is still PENDING by then (see lib/tasks/syncReminder.ts,
 * which cancels it the moment the task is completed).
 */
const NONE_AFTER_MS = HOUR_MS;

export function computeRemindAt(dueDate: Date, offset: ReminderOffset): Date {
  if (offset === ReminderOffset.NONE) {
    return new Date(dueDate.getTime() + NONE_AFTER_MS);
  }
  return new Date(dueDate.getTime() - OFFSET_BEFORE_MS[offset]);
}
