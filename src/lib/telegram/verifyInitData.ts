import crypto from "node:crypto";

/**
 * The subset of Telegram's WebAppUser we actually use. Telegram sends more
 * fields (is_premium, allows_write_to_pm, ...) but we only trust and persist
 * these.
 */
export interface TelegramInitDataUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface VerifiedInitData {
  user: TelegramInitDataUser;
  authDate: number;
}

const DEFAULT_MAX_AGE_SECONDS = 86400;

function getMaxAgeSeconds(): number {
  const raw = Number(process.env.TELEGRAM_AUTH_MAX_AGE_SECONDS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_MAX_AGE_SECONDS;
}

/**
 * Verifies a Telegram WebApp `initData` string against the bot token, per
 * Telegram's documented algorithm:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Returns the verified user + auth timestamp on success, or `null` if the
 * data is missing, malformed, has an invalid signature, or has expired.
 * This is the ONLY place a Telegram identity is ever trusted from — every
 * other layer of the app treats `telegramId` as opaque, server-derived data.
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string
): VerifiedInitData | null {
  if (!initData || !botToken) return null;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(initData);
  } catch {
    return null;
  }

  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const providedHashBuffer = Buffer.from(hash, "hex");
  const computedHashBuffer = Buffer.from(computedHash, "hex");
  if (
    providedHashBuffer.length !== computedHashBuffer.length ||
    !crypto.timingSafeEqual(providedHashBuffer, computedHashBuffer)
  ) {
    return null;
  }

  const authDate = Number(params.get("auth_date"));
  if (!authDate || Date.now() / 1000 - authDate > getMaxAgeSeconds()) {
    return null;
  }

  const userRaw = params.get("user");
  if (!userRaw) return null;

  let user: TelegramInitDataUser;
  try {
    user = JSON.parse(userRaw);
  } catch {
    return null;
  }
  if (!user || typeof user.id !== "number" || !user.first_name) return null;

  return { user, authDate };
}
