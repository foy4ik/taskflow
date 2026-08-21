import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Registered by TelegramProvider so a 401 (session cookie missing/expired)
 * can trigger one silent re-auth + retry instead of surfacing an error —
 * `initData` stays available client-side for the app's whole lifetime, so
 * the user never sees a "log in again" prompt.
 */
let unauthorizedHandler: (() => Promise<void>) | null = null;

export function setUnauthorizedHandler(handler: (() => Promise<void>) | null) {
  unauthorizedHandler = handler;
}

async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (response.status === 401 && !retried && unauthorizedHandler) {
    await unauthorizedHandler();
    return request<T>(path, init, true);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;
    throw new ApiError(
      errorBody?.error?.code ?? "UNKNOWN_ERROR",
      errorBody?.error?.message ?? "Something went wrong. Please try again.",
      response.status,
      errorBody?.error?.details
    );
  }

  return body as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
