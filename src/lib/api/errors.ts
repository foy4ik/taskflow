import { ZodError } from "zod";
import { fail } from "./response";

export class AppError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super("NOT_FOUND", message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid request", details?: unknown) {
    super("VALIDATION_ERROR", message, 400, details);
  }
}

/**
 * Wraps a Route Handler so every thrown error becomes a well-formed JSON
 * error response instead of an unhandled 500 with a leaking stack trace.
 * Keeps individual route handlers free of repetitive try/catch blocks.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ZodError) {
        return fail("VALIDATION_ERROR", "Invalid request data", 400, error.flatten());
      }
      if (error instanceof AppError) {
        return fail(error.code, error.message, error.status, error.details);
      }
      console.error("[api] Unhandled error:", error);
      return fail("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
    }
  };
}
