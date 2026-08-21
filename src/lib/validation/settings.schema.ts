import { z } from "zod";
import { Locale, ThemePreference } from "@/generated/prisma/enums";

export const updateSettingsSchema = z
  .object({
    timezone: z.string().trim().min(1).max(100),
    theme: z.enum(ThemePreference),
    locale: z.enum(Locale),
    notificationsEnabled: z.boolean(),
  })
  .partial();

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
