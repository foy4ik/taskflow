import type { User } from "@/generated/prisma/client";
import type { PublicUser } from "@/types/user";

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: user.photoUrl,
    timezone: user.timezone,
    theme: user.theme,
    locale: user.locale,
    notificationsEnabled: user.notificationsEnabled,
    createdAt: user.createdAt.toISOString(),
  };
}
