const TELEGRAM_API_BASE = "https://api.telegram.org";

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return token;
}

interface SendMessageParams {
  chatId: number | string;
  text: string;
  /** Adds a single inline button under the message that launches the Mini App. */
  webAppButton?: { text: string; url: string };
}

/**
 * Thin wrapper around Telegram's Bot API `sendMessage`. Used by the webhook
 * handler to reply to /start — the only outbound bot message this app
 * sends today, distinct from `lib/notifications/sendReminder.ts`'s stub.
 */
export async function sendTelegramMessage({ chatId, text, webAppButton }: SendMessageParams): Promise<void> {
  const token = getBotToken();

  const body: Record<string, unknown> = { chat_id: chatId, text };
  if (webAppButton) {
    body.reply_markup = {
      inline_keyboard: [[{ text: webAppButton.text, web_app: { url: webAppButton.url } }]],
    };
  }

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("[telegram] sendMessage failed:", response.status, errorBody);
  }
}
