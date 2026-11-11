// ====================================================================
// Kal Furniture - Telegram Bot Local Polling Runner
// Run this to test and control the bot locally: npm run bot
// ====================================================================

import dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, "../.env.local") });

// Ensure single instance running locally
const PID_FILE = join(__dirname, "../.bot.pid");
if (fs.existsSync(PID_FILE)) {
  try {
    const rawPid = fs.readFileSync(PID_FILE, "utf-8").trim();
    const oldPid = parseInt(rawPid, 10);
    if (oldPid && oldPid !== process.pid) {
      try {
        process.kill(oldPid, "SIGTERM");
        console.log(`⚠️  Terminated older bot instance (PID: ${oldPid}) to avoid getUpdates conflict.`);
      } catch (e) {
        // Not running
      }
    }
  } catch {}
}
try {
  fs.writeFileSync(PID_FILE, String(process.pid));
} catch {}

function cleanPid() {
  try {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
  } catch {}
}

process.on("uncaughtException", (err) => {
  console.warn("⚠️  [UncaughtException Handler]:", err.message || err);
});
process.on("unhandledRejection", (reason) => {
  console.warn("⚠️  [UnhandledRejection Handler]:", reason?.message || reason);
});

process.on("exit", cleanPid);
process.on("SIGINT", () => {
  console.log("\n🛑 Stopping Telegram Bot polling...");
  cleanPid();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanPid();
  process.exit(0);
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN is missing in .env.local");
  process.exit(1);
}

const { handleTelegramUpdate } = await import("../lib/telegramBotCore.js");
const { deleteTelegramWebhook, setTelegramCommands, setTelegramChatMenuButton } = await import("../lib/telegram.js");

console.log("\n========================================================");
console.log("🛋️   KAL FURNITURE — TELEGRAM ADMIN BOT RUNNER");
console.log("========================================================");
console.log(`🤖 Bot Token: ${BOT_TOKEN.slice(0, 10)}...`);
console.log(`🛡️  Admin IDs: ${ADMIN_IDS.join(", ") || "None configured!"}`);
console.log("--------------------------------------------------------");

// 1. Delete webhook so polling mode receives updates cleanly
try {
  console.log("📡 Ensuring webhook is cleared for polling mode...");
  await deleteTelegramWebhook();
  console.log("✅ Webhook cleared. Polling mode activated.");
} catch (err) {
  console.warn("⚠️  Could not clear webhook:", err.message);
}

// 2. Register Commands and Menu Button
try {
  console.log("⚙️  Registering '/' commands list and Chat Menu button with Telegram...");
  await setTelegramCommands();
  await setTelegramChatMenuButton();
  console.log("✅ Commands list & Menu button registered successfully!");
} catch (err) {
  console.warn("⚠️  Could not set commands/menu button:", err.message);
}

// 3. Fetch bot info
try {
  const meRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
  const meData = await meRes.json();
  if (meData.ok) {
    console.log(`✨ Connected as: @${meData.result.username} (${meData.result.first_name})`);
    console.log(`👉 Open Telegram and message: https://t.me/${meData.result.username}`);
  }
} catch (e) {
  console.warn("⚠️  Could not fetch bot username:", e.message);
}

console.log("\n🚀 Listening for commands... (Press Ctrl+C to stop)\n");

let offset = 0;
let isRunning = true;

async function pollUpdates() {
  while (isRunning) {
    try {
      // Short-poll with timeout=0 and explicit signal prevents stalled sockets
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=0`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        if (data.result.length > 0) {
          for (const update of data.result) {
            offset = update.update_id + 1;
            const fromUser = update.message?.from || update.callback_query?.from;
            const actionText = update.message?.text || update.callback_query?.data || (update.message?.photo ? "[Photo]" : "[Action]");
            
            console.log(`[${new Date().toLocaleTimeString()}] Update #${update.update_id} from ${fromUser?.first_name || "User"} (${fromUser?.id}): ${actionText}`);
            
            // Delegate to core handler
            try {
              await handleTelegramUpdate(update);
            } catch (handlerErr) {
              console.error("❌ Handler Error:", handlerErr);
            }
          }
          // Process next batch immediately
          continue;
        }
      } else if (!data.ok) {
        console.warn("⚠️  getUpdates warning:", data.description);
        const retryAfter = (data.parameters?.retry_after || 5) * 1000;
        await new Promise((r) => setTimeout(r, retryAfter));
        continue;
      }
    } catch (err) {
      // Gentle retry backoff on occasional network drops
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Smooth 1.2s cadence when idle
    await new Promise((r) => setTimeout(r, 1200));
  }
}

pollUpdates().catch((err) => {
  console.error("💥 Fatal pollUpdates Error:", err);
});
