import type { NextRequest } from "next/server";
import { UnauthorizedError } from "@/lib/api/errors";

/**
 * Reads the verified user id that `proxy.ts` attaches to every request that
 * passes session verification. Route handlers never re-verify the session —
 * `proxy.ts` is the single source of truth — they just read this header.
 * Throws if it's missing, which should be unreachable for matched routes
 * (proxy already returns 401 first) but guards against misconfiguration.
 */
export function requireUserId(request: NextRequest): string {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}
