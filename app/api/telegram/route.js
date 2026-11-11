import { NextResponse } from "next/server";
import {
  setTelegramWebhook,
  getTelegramWebhookInfo,
  deleteTelegramWebhook,
  notifyAdmins,
  setTelegramCommands,
  setTelegramChatMenuButton,
} from "@/lib/telegram";
import { handleTelegramUpdate } from "@/lib/telegramBotCore";

export async function POST(request) {
  try {
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (configuredSecret) {
      const incomingSecret = request.headers.get("x-telegram-bot-api-secret-token");
      if (incomingSecret !== configuredSecret) {
        console.warn("[Telegram Webhook] Unauthorized request rejected (invalid secret token).");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const update = await request.json();
    if (!update) {
      return NextResponse.json({ ok: false, error: "Empty payload" }, { status: 400 });
    }

    // Process update asynchronously or synchronously
    await handleTelegramUpdate(update);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Telegram Webhook POST Error]:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "setWebhook") {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kalefurnitures.com";
      const webhookUrl = `${siteUrl.replace(/\/$/, "")}/api/telegram`;
      const secret = process.env.TELEGRAM_WEBHOOK_SECRET || "";

      const res = await setTelegramWebhook(webhookUrl, secret);
      await setTelegramCommands();
      await setTelegramChatMenuButton();
      return NextResponse.json({
        action: "setWebhook",
        webhookUrl,
        hasSecret: Boolean(secret),
        result: res,
        commandsSet: true,
      });
    }

    if (action === "setCommands") {
      const cmdRes = await setTelegramCommands();
      const menuRes = await setTelegramChatMenuButton();
      return NextResponse.json({
        action: "setCommands",
        setMyCommands: cmdRes,
        setChatMenuButton: menuRes,
      });
    }

    if (action === "getInfo") {
      const info = await getTelegramWebhookInfo();
      return NextResponse.json({ action: "getInfo", info });
    }

    if (action === "deleteWebhook") {
      const res = await deleteTelegramWebhook();
      return NextResponse.json({ action: "deleteWebhook", result: res });
    }

    if (action === "test") {
      const results = await notifyAdmins(
        "👋 <b>Kal Furniture Telegram Bot Test</b>\n━━━━━━━━━━━━━━━━━━━━━━\nYour Telegram Admin Bot is connected and ready to receive commands!"
      );
      return NextResponse.json({ action: "test", results });
    }

    return NextResponse.json({
      status: "Kal Furniture Telegram Bot API Route active",
      availableActions: [
        "?action=getInfo",
        "?action=setWebhook",
        "?action=deleteWebhook",
        "?action=test",
      ],
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

