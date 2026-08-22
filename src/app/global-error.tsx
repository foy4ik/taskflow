"use client";

/**
 * Last-resort boundary — only fires if the root layout itself (fonts,
 * AppProviders, the Telegram script tag) throws, which `error.tsx` can't
 * catch. Must render its own <html>/<body> and can't rely on globals.css
 * or any of our providers, so it's deliberately plain and self-contained.
 */
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <style>{`
          body {
            margin: 0;
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #ffffff;
            color: #171717;
          }
          @media (prefers-color-scheme: dark) {
            body { background: #0a0a0a; color: #ededed; }
          }
          .card { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 1.5rem; text-align: center; }
          button {
            border-radius: 9999px;
            padding: 0.5rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 500;
            background: #4f46e5;
            color: #fff;
            border: none;
            cursor: pointer;
          }
        `}</style>
        <div className="card">
          <p style={{ fontSize: "1.125rem", fontWeight: 500 }}>
            Something went wrong / Что-то пошло не так
          </p>
          <p style={{ fontSize: "0.875rem", opacity: 0.7, maxWidth: 280 }}>
            Please reload the app / Пожалуйста, перезапустите приложение
          </p>
          <button type="button" onClick={() => retry()}>
            Try again / Повторить
          </button>
        </div>
      </body>
    </html>
  );
}
