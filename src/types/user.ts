import type { Locale, ThemePreference } from "@/generated/prisma/enums";

/** The shape of a user as returned by the API — never exposes telegramId. */
export interface PublicUser {
  id: string;
  username: string | null;
  firstName: string;
  lastName: string | null;
  photoUrl: string | null;
  timezone: string;
  theme: ThemePreference;
  locale: Locale;
  notificationsEnabled: boolean;
  createdAt: string;
}

export interface UpdateSettingsInput {
  timezone?: string;
  theme?: ThemePreference;
  locale?: Locale;
  notificationsEnabled?: boolean;
}
