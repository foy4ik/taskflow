import type { NextRequest } from "next/server";
import { verifyTelegramInitData } from "@/lib/telegram/verifyInitData";
import { isMockAuthAllowed, MOCK_TELEGRAM_USER } from "@/lib/telegram/mockInitData";
import { signSession, SESSION_COOKIE } from "@/lib/telegram/session";
import { prisma } from "@/lib/prisma";
import { toPublicUser } from "@/lib/serializers/user";
import { ok, fail } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/errors";
import { Locale } from "@/generated/prisma/enums";

interface AuthRequestBody {
  initData?: string;
  mock?: boolean;
}

/**
 * Exchanges a Telegram WebApp `initData` string for a `taskflow_session`
 * cookie. This is the only endpoint that ever writes identity fields
 * (name/username/photo) — always from server-verified Telegram data, never
 * from any other request body.
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = (await request.json().catch(() => null)) as AuthRequestBody | null;

  let telegramUser: { id: number; first_name: string; last_name?: string; username?: string; language_code?: string; photo_url?: string };

  if (body?.mock === true) {
    if (!isMockAuthAllowed()) {
      return fail("UNAUTHORIZED", "Mock auth is disabled", 401);
    }
    console.warn(
      "[auth] Using DEV MOCK Telegram auth (ALLOW_MOCK_TELEGRAM_AUTH=true). Never enable this in production."
    );
    telegramUser = MOCK_TELEGRAM_USER;
  } else {
    const initData = typeof body?.initData === "string" ? body.initData : "";
    const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
    const verified = verifyTelegramInitData(initData, botToken);
    if (!verified) {
      return fail("UNAUTHORIZED", "Invalid Telegram authentication data", 401);
    }
    telegramUser = verified.user;
  }

  const telegramId = String(telegramUser.id);
  const inferredLocale: Locale = telegramUser.language_code?.toLowerCase().startsWith("ru")
    ? Locale.RU
    : Locale.EN;

  const user = await prisma.user.upsert({
    where: { telegramId },
    update: {
      username: telegramUser.username ?? null,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name ?? null,
      languageCode: telegramUser.language_code ?? null,
      photoUrl: telegramUser.photo_url ?? null,
    },
    create: {
      telegramId,
      username: telegramUser.username ?? null,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name ?? null,
      languageCode: telegramUser.language_code ?? null,
      photoUrl: telegramUser.photo_url ?? null,
      locale: inferredLocale,
    },
  });

  const token = await signSession({ sub: user.id, telegramId: user.telegramId });

  const response = ok({ user: toPublicUser(user) });
  response.cookies.set(SESSION_COOKIE.name, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: SESSION_COOKIE.maxAge,
  });
  return response;
});
