import type { WebApp as TelegramWebAppType } from "@twa-dev/types";

export type TelegramWebApp = TelegramWebAppType;

/**
 * We intentionally do NOT use `@twa-dev/sdk`'s default export — its `sdk.js`
 * reads `window` at module top-level (`var telegramWindow = window`), which
 * throws during Next.js's server-side render of client components. Instead,
 * we load Telegram's own `telegram-web-app.js` via <Script> in the root
 * layout (see providers/TelegramProvider.tsx) and read `window.Telegram`
 * lazily, only inside effects that run in the browser.
 */
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export {};
