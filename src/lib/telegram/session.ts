import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = {
  name: "taskflow_session",
  maxAge: 60 * 60 * 24, // 24h, in seconds
} as const;

export interface SessionPayload {
  /** Internal User.id (cuid), never the raw Telegram id. */
  sub: string;
  telegramId: string;
}

let cachedSecret: Uint8Array | null = null;

function getSecretKey(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET is not set (or too short) — set a random 32+ byte value in .env"
    );
  }
  cachedSecret = new TextEncoder().encode(secret);
  return cachedSecret;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ telegramId: payload.telegramId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_COOKIE.maxAge}s`)
    .sign(getSecretKey());
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.sub !== "string" || typeof payload.telegramId !== "string") {
      return null;
    }
    return { sub: payload.sub, telegramId: payload.telegramId };
  } catch {
    return null;
  }
}
