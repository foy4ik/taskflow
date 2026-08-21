import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/telegram/session";

/**
 * Runs before every /api/tasks, /api/statistics, and /api/me request.
 * Verifies the session cookie and, on success, attaches the verified user id
 * as `x-user-id` for downstream route handlers — they never re-derive it
 * from anything client-controlled. On failure, responds 401 directly so the
 * route handler never runs unauthenticated.
 *
 * (Named `proxy`, not `middleware` — Next.js 16 renamed the file
 * convention; see node_modules/next/dist/docs/.../proxy.md.)
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE.name)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.sub);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/api/tasks/:path*",
    "/api/statistics/:path*",
    "/api/me/:path*",
    "/api/categories/:path*",
  ],
};
