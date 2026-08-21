import type { TelegramInitDataUser } from "./verifyInitData";

/**
 * Dev-only fallback so the app can be exercised in a plain browser, without a
 * real Telegram bot/token yet. This path is double-gated (see
 * `isMockAuthAllowed`) and can NEVER activate in production, regardless of
 * how `ALLOW_MOCK_TELEGRAM_AUTH` is set — `NODE_ENV` is not client-settable.
 *
 * Unlike real auth, the client sends no identity claims at all here — the
 * mock user is a fixed constant owned by the server, so this path can't be
 * abused to impersonate an arbitrary telegramId even in dev.
 */
export const MOCK_TELEGRAM_USER: TelegramInitDataUser = {
  id: 1,
  first_name: "Alex",
  last_name: "Morgan",
  username: "alex_dev",
  language_code: "en",
};

export function isMockAuthAllowed(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ALLOW_MOCK_TELEGRAM_AUTH === "true"
  );
}
