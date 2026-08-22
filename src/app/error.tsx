"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Catches any uncaught rendering error below the root layout (i.e. inside
 * any page/feature component), so a bug in one screen shows a recoverable
 * "something went wrong" fallback instead of unmounting the whole React
 * tree — which previously reset TelegramProvider's auth state too, making
 * an unrelated crash look like the user got logged out.
 *
 * Kept dependency-free (no i18n/theme context) on purpose: this is the
 * safety net, so it shouldn't itself be able to fail if a provider is what
 * broke. AppProviders sits above this boundary either way (it wraps
 * `children` in the root layout), so app state survives a retry.
 */
export default function ErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium text-foreground">Something went wrong / Что-то пошло не так</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Please try again / Пожалуйста, попробуйте ещё раз
        </p>
      </div>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Try again / Повторить
      </button>
    </div>
  );
}
