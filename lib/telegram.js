// ====================================================================
// Kal Furniture - Telegram Bot API Client
// Handles messaging, alerts, inline keyboards, and webhook management.
// ====================================================================

import dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}

function getBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN;
}

let cachedDbAdminIds = null;
let lastAdminCacheTime = 0;
const ADMIN_CACHE_TTL_MS = 3 * 1000; // 3s short TTL so admin panel changes propagate instantly

/**
 * Fetch authorized Telegram admin IDs stored in database site_settings
 * Uses direct REST fetch with cache: 'no-store' to avoid webpack dynamic-import or Next.js cache issues.
 */
export async function fetchDbAdminIds(forceFresh = false) {
  const now = Date.now();
  if (!forceFresh && cachedDbAdminIds && now - lastAdminCacheTime < ADMIN_CACHE_TTL_MS) {
    return cachedDbAdminIds;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return cachedDbAdminIds || [];

  const keysToTry = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ].filter(Boolean);

  for (const apiKey of keysToTry) {
    try {
      const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/site_settings?key=eq.telegram_admins&select=value`;
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        continue;
      }

      const rows = await res.json();
      const row = Array.isArray(rows) ? rows[0] : null;
      const val = row?.value;

      if (Array.isArray(val)) {
        cachedDbAdminIds = val
          .map((item) => (typeof item === "string" ? item : item?.telegramId || item?.id))
          .filter(Boolean)
          .map((id) => String(id).trim());
        lastAdminCacheTime = now;
        return cachedDbAdminIds;
      } else {
        // Row not found or empty array
        cachedDbAdminIds = [];
        lastAdminCacheTime = now;
        return cachedDbAdminIds;
      }
    } catch (err) {
      console.warn("[Telegram] fetchDbAdminIds attempt failed:", err.message);
    }
  }

  return cachedDbAdminIds || [];
}

/**
 * Invalidate the admin ID cache immediately (called when an admin is added or removed)
 */
export function clearAdminIdsCache() {
  cachedDbAdminIds = null;
  lastAdminCacheTime = 0;
}

/**
 * Get environment variable admin IDs
 */
export function getEnvAdminChatIds() {
  const ids = process.env.TELEGRAM_ADMIN_IDS || "";
  return ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * Get all authorized admin Telegram IDs (both from environment and Supabase)
 */
export async function getAdminChatIds() {
  const envIds = getEnvAdminChatIds();
  const dbIds = await fetchDbAdminIds(true);
  return Array.from(new Set([...envIds, ...dbIds]));
}

/**
 * Check if a user ID is an authorized admin (checks env instantly, then database)
 */
export async function isAuthorizedAdmin(userId) {
  if (!userId) return false;
  const targetId = String(userId).trim();

  // Instant check against env IDs (zero latency)
  const envIds = getEnvAdminChatIds();
  if (envIds.includes(targetId)) return true;

  // Fetch fresh DB list if not currently cached/present
  let dbIds = await fetchDbAdminIds(false);
  if (dbIds.includes(targetId)) return true;

  // Double-check live DB bypassing short cache so newly added admins get access immediately
  dbIds = await fetchDbAdminIds(true);
  return dbIds.includes(targetId);
}

/**
 * Low-level call to Telegram Bot API
 */
export async function callTelegramApi(method, body = {}) {
  const token = getBotToken();
  if (!token) {
    console.error("[Telegram] TELEGRAM_BOT_TOKEN is not configured.");
    return { ok: false, description: "TELEGRAM_BOT_TOKEN is missing" };
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });

      const data = await res.json();
      if (!data.ok) {
        // Silently handle benign probe/fallback errors
        const benignErrors = [
          "there is no caption in the message to edit",
          "there is no text in the message to edit",
          "message is not modified",
        ];
        const isBenign = benignErrors.some((b) => data.description?.toLowerCase().includes(b.toLowerCase()));
        if (!isBenign) {
          console.warn(`[Telegram API Error] ${method}:`, data.description);
        }
      }
      return data;
    } catch (error) {
      if (attempt === 2) {
        console.error(`[Telegram Network Error] ${method}:`, error.message);
        return { ok: false, description: error.message };
      }
      await new Promise((r) => setTimeout(r, 600));
    }
  }
}

/**
 * Send an HTML-formatted message
 */
export async function sendTelegramMessage(chatId, text, options = {}) {
  return callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options.parse_mode || "HTML",
    disable_web_page_preview: options.disable_web_page_preview ?? true,
    reply_markup: options.reply_markup,
  });
}

/**
 * Edit an existing message (used for fast interactive button responses)
 */
export async function editTelegramMessage(chatId, messageId, text, options = {}) {
  return callTelegramApi("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: options.parse_mode || "HTML",
    disable_web_page_preview: options.disable_web_page_preview ?? true,
    reply_markup: options.reply_markup,
  });
}

/**
 * Edit caption of an existing photo/media message
 */
export async function editTelegramCaption(chatId, messageId, caption, options = {}) {
  return callTelegramApi("editMessageCaption", {
    chat_id: chatId,
    message_id: messageId,
    caption,
    parse_mode: options.parse_mode || "HTML",
    reply_markup: options.reply_markup,
  });
}

/**
 * Edit media (photo) of an existing photo message in-place
 */
export async function editTelegramMedia(chatId, messageId, photoUrl, caption, options = {}) {
  return callTelegramApi("editMessageMedia", {
    chat_id: chatId,
    message_id: messageId,
    media: {
      type: "photo",
      media: photoUrl,
      caption: caption,
      parse_mode: options.parse_mode || "HTML",
    },
    reply_markup: options.reply_markup,
  });
}

/**
 * Delete a message from chat
 */
export async function deleteTelegramMessage(chatId, messageId) {
  return callTelegramApi("deleteMessage", {
    chat_id: chatId,
    message_id: messageId,
  });
}

/**
 * Answer an inline callback query (acknowledges button press)
 */
export async function answerCallbackQuery(callbackQueryId, text = "", showAlert = false) {
  return callTelegramApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}

/**
 * Send a photo to Telegram chat
 */
export async function sendTelegramPhoto(chatId, photoUrl, caption = "", options = {}) {
  return callTelegramApi("sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: options.parse_mode || "HTML",
    reply_markup: options.reply_markup,
  });
}

/**
 * Notify all configured admin chats with a message
 */
export async function notifyAdmins(text, options = {}) {
  const adminIds = await getAdminChatIds();
  if (adminIds.length === 0) {
    console.warn("[Telegram] No authorized admin IDs configured for notifications.");
    return [];
  }

  const results = await Promise.allSettled(
    adminIds.map((chatId) => sendTelegramMessage(chatId, text, options))
  );
  return results;
}

/**
 * Send real-time alert to all admins when a new order or customer inquiry arrives
 */
export async function notifyAdminsOnNewOrder(orderData) {
  const { totalEtb, itemCount, items = [], customerName, customerPhone } = orderData;
  const formattedTotal = Number(totalEtb || 0).toLocaleString();

  let itemsList = "<i>No item details</i>";
  if (Array.isArray(items) && items.length > 0) {
    itemsList = items
      .map(
        (item) =>
          `• <b>${item.name || "Item"}</b> x ${item.quantity || 1} ${
            item.price ? `(${Number(item.price).toLocaleString()} ብር)` : ""
          }${item.selectedColor ? ` [Color: ${item.selectedColor}]` : ""}`
      )
      .join("\n");
  }

  const customerInfo = [];
  if (customerName) customerInfo.push(`👤 <b>Customer:</b> ${customerName}`);
  if (customerPhone) customerInfo.push(`📞 <b>Phone:</b> ${customerPhone}`);

  const message = [
    `✨ <b>NEW ORDER / INQUIRY RECEIVED!</b> ✨`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `💰 <b>Total Amount:</b> <code>${formattedTotal} ብር</code>`,
    `📦 <b>Total Items:</b> ${itemCount || items.length || 1}`,
    ...(customerInfo.length > 0 ? customerInfo : []),
    `\n<b>Ordered Products:</b>\n${itemsList}`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📅 <i>${new Date().toLocaleString("en-US", { timeZone: "Africa/Addis_Ababa" })} (EAT)</i>`,
  ].join("\n");

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: "📊 View Dashboard", callback_data: "menu_stats" },
        { text: "📦 Recent Orders", callback_data: "menu_orders" },
      ],
    ],
  };

  return notifyAdmins(message, { reply_markup: replyMarkup });
}

/**
 * Get file download URL from Telegram
 */
export async function getTelegramFileUrl(fileId) {
  const res = await callTelegramApi("getFile", { file_id: fileId });
  if (res.ok && res.result?.file_path) {
    const token = getBotToken();
    return `https://api.telegram.org/file/bot${token}/${res.result.file_path}`;
  }
  return null;
}

/**
 * Webhook management helpers
 */
export async function setTelegramWebhook(webhookUrl, secretToken) {
  const payload = {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: false,
  };
  if (secretToken) {
    payload.secret_token = secretToken;
  }
  return callTelegramApi("setWebhook", payload);
}

export async function getTelegramWebhookInfo() {
  return callTelegramApi("getWebhookInfo");
}

export async function deleteTelegramWebhook(dropPendingUpdates = false) {
  return callTelegramApi("deleteWebhook", {
    drop_pending_updates: dropPendingUpdates,
  });
}

/**
 * Configure Telegram Bot Command List (appears when typing '/')
 */
export async function setTelegramCommands(commands = null) {
  const defaultCommands = [
    { command: "menu", description: "👑 Open Admin Dashboard Menu" },
    { command: "products", description: "🛋️ Browse products & photos by category" },
    { command: "addproduct", description: "➕ Add new furniture product (Wizard)" },
    { command: "stats", description: "📊 Showroom revenue & sales analytics" },
    { command: "orders", description: "📦 View recent customer inquiries" },
    { command: "promo", description: "📢 Manage website announcement banner" },
    { command: "cancel", description: "❌ Cancel any active input wizard" },
    { command: "help", description: "📖 Show admin command guide" },
  ];

  return callTelegramApi("setMyCommands", {
    commands: commands || defaultCommands,
  });
}

/**
 * Configure the Menu button inside the Telegram chat text input box
 */
export async function setTelegramChatMenuButton(chatId = null) {
  const payload = {
    menu_button: { type: "commands" },
  };
  if (chatId) {
    payload.chat_id = chatId;
  }
  return callTelegramApi("setChatMenuButton", payload);
}

/**
 * Retrieve bot account details (username, display name, id)
 */
export async function getTelegramBotInfo() {
  const res = await callTelegramApi("getMe");
  if (res && res.ok && res.result) {
    return {
      ok: true,
      id: res.result.id,
      username: res.result.username,
      firstName: res.result.first_name,
      canJoinGroups: res.result.can_join_groups,
      supportsInlineQueries: res.result.supports_inline_queries,
    };
  }
  return {
    ok: false,
    username: "KalFurnitureAdminBot",
    firstName: "Kal Furniture Admin",
    error: res?.description || "Failed to reach Telegram API",
  };
}
