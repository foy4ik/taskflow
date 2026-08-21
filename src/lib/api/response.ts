import { NextResponse } from "next/server";

/**
 * Consistent API response envelope used by every route handler:
 *   success -> { data: T }            (optionally with `meta`)
 *   failure -> { error: { code, message, details? } }
 */

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function okWithMeta<T, M>(data: T, meta: M, status = 200): NextResponse {
  return NextResponse.json({ data, meta }, { status });
}

export function fail(
  code: string,
  message: string,
  status: number,
  details?: unknown
): NextResponse {
  return NextResponse.json({ error: { code, message, details } }, { status });
}
