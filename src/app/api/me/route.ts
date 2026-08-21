import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/requireUser";
import { withErrorHandling, NotFoundError } from "@/lib/api/errors";
import { ok } from "@/lib/api/response";
import { toPublicUser } from "@/lib/serializers/user";
import { updateSettingsSchema } from "@/lib/validation/settings.schema";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const userId = requireUserId(request);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");
  return ok(toPublicUser(user));
});

// Deliberately whitelists only preference fields via the zod schema — never
// firstName/lastName/username/telegramId, which are only ever synced from
// verified Telegram initData in /api/auth/telegram.
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const userId = requireUserId(request);
  const input = updateSettingsSchema.parse(await request.json());

  const user = await prisma.user.update({ where: { id: userId }, data: input });
  return ok(toPublicUser(user));
});
