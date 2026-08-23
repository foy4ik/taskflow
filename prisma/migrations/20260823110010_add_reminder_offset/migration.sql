-- CreateEnum
CREATE TYPE "ReminderOffset" AS ENUM ('AT_TIME', 'THIRTY_MIN_BEFORE', 'ONE_HOUR_BEFORE', 'ONE_DAY_BEFORE', 'NONE');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "reminderOffset" "ReminderOffset" NOT NULL DEFAULT 'THIRTY_MIN_BEFORE';
