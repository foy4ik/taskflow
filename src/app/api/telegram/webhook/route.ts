import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram/bot";

const WELCOME_TEXT =
  "Здравствуйте 👋, это бот для записи дел и планов, чтобы не забыть про них.\n\n" +
  "Бот пришлёт вам уведомление-напоминание про ваш план, чтобы вы точно не забыли.\n\n" +
  "Заходите, создавайте задачи, планы, дела — чтобы точно не забыть про них.";

const OPEN_APP_BUTTON_TEXT = "🚀 Открыть TaskFlow";

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
}

/**
 * Telegram webhook endpoint — receives every update sent to the bot.
 * Authenticated via the `X-Telegram-Bot-Api-Secret-Token` header (set once
 * when registering the webhook via `setWebhook`), not the session cookie —
 * this is a server-to-server call from Telegram, not a user request.
 *
 * Only handles /start today: replies with a welcome message plus an inline
 * button that launches the Mini App. Any other update is acknowledged and
 * ignored.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!secret || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  const message = update?.message;

  if (message?.text?.startsWith("/start")) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    try {
      await sendTelegramMessage({
        chatId: message.chat.id,
        text: WELCOME_TEXT,
        webAppButton: appUrl ? { text: OPEN_APP_BUTTON_TEXT, url: appUrl } : undefined,
      });
    } catch (error) {
      console.error("[telegram webhook] Failed to send /start reply:", error);
    }
  }

  // Always acknowledge quickly with 2xx — Telegram retries (with backoff) on
  // anything else, which would otherwise resend the same update repeatedly.
  return NextResponse.json({ ok: true });
}
