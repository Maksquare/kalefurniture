// ====================================================================
// Kal Furniture - Telegram Bot Core Engine (v3 Production)
// Ultra-compact callback encoding (< 64 bytes)
// Smooth in-place photo updates with editMessageMedia
// Full interactive wizard for adding, editing, toggling, and deleting products
// ====================================================================

import dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {}
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  sendTelegramMessage,
  editTelegramMessage,
  answerCallbackQuery,
  sendTelegramPhoto,
  editTelegramMedia,
  editTelegramCaption,
  deleteTelegramMessage,
  isAuthorizedAdmin,
  getTelegramFileUrl,
} from "./telegram.js";

// In-memory sessions for wizards and active text prompts
const userSessions = new Map();

function getSession(userId) {
  const session = userSessions.get(String(userId));
  if (!session) return null;
  if (Date.now() - session.lastUpdated > 45 * 60 * 1000) {
    userSessions.delete(String(userId));
    return null;
  }
  return session;
}

function setSession(userId, data) {
  userSessions.set(String(userId), { ...data, lastUpdated: Date.now() });
}

function clearSession(userId) {
  userSessions.delete(String(userId));
}

function getDbClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getAbsoluteImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kalefurnitures.com";
  const cleanBase = siteUrl.replace(/\/$/, "");
  const cleanPath = img.startsWith("/") ? img : `/${img}`;
  return `${cleanBase}${cleanPath}`;
}

export async function getCategoryList(supabase) {
  const { data: prods } = await supabase.from("products").select("category");
  const catSet = new Set();
  (prods || []).forEach((p) => {
    if (p.category && p.category.trim()) catSet.add(p.category.trim());
  });
  const list = Array.from(catSet);
  return list.length > 0 ? list.sort() : ["Living Room", "Dining Area", "Bedroom", "Office"];
}

// ────────────────────────────────────────────────────────────────────
// MAIN MENU
// ────────────────────────────────────────────────────────────────────
export function getMainKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🛋️ Browse Products & Photos", callback_data: "m_cats" },
        { text: "➕ Add New Product", callback_data: "w_start" },
      ],
      [
        { text: "📊 Showroom Analytics", callback_data: "m_stats" },
        { text: "📦 Recent Inquiries", callback_data: "m_orders" },
      ],
      [
        { text: "📢 Website Promo Banner", callback_data: "m_promo" },
        { text: "📖 Help & Guide", callback_data: "m_help" },
      ],
    ],
  };
}

export async function sendMainMenu(chatId, messageId = null) {
  const text = [
    `👑 <b>Kal Furniture — Admin Command Studio</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `Welcome! Control showroom inventory, edit prices, toggle color options, and view live inquiries directly from your phone.`,
    ``,
    `Select an option below or tap the <b>Menu</b> button:`,
  ].join("\n");

  const markup = getMainKeyboard();
  if (messageId) {
    const editMsg = await editTelegramMessage(chatId, messageId, text, { reply_markup: markup });
    if (editMsg?.ok) return editMsg;
    const editCap = await editTelegramCaption(chatId, messageId, text, { reply_markup: markup });
    if (editCap?.ok) return editCap;
    try { await deleteTelegramMessage(chatId, messageId); } catch {}
  }
  return sendTelegramMessage(chatId, text, { reply_markup: markup });
}

// ────────────────────────────────────────────────────────────────────
// 1. PRODUCT BROWSING BY CATEGORY WITH PHOTOS & CAROUSEL
// ────────────────────────────────────────────────────────────────────
export async function handleCategoryOverview(chatId, messageId = null) {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const categories = await getCategoryList(supabase);
    const { data: prods } = await supabase.from("products").select("category");

    const countMap = {};
    (prods || []).forEach((p) => {
      const c = p.category?.trim() || "Uncategorized";
      countMap[c] = (countMap[c] || 0) + 1;
    });

    const totalCount = (prods || []).length;
    const buttons = [];

    // Category buttons: callback 'c_p:<catIdx>:0'
    categories.forEach((cat, idx) => {
      const count = countMap[cat] || 0;
      buttons.push([
        { text: `📍 ${cat} (${count} items)`, callback_data: `c_p:${idx}:0` },
      ]);
    });

    buttons.push([
      { text: `🌟 Browse All Products (${totalCount} items)`, callback_data: "c_p:ALL:0" },
    ]);
    buttons.push([
      { text: "➕ Add New Product", callback_data: "w_start" },
      { text: "« Main Menu", callback_data: "m_main" },
    ]);

    const text = [
      `🛋️ <b>Kal Furniture — Showroom Catalog</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `Select a category below to browse items with photos, stock controls, and editing tools:`,
      ``,
      ...categories.map((c) => `📍 <b>${c}</b>: ${countMap[c] || 0} items`),
      `\n🌟 Total Inventory: <b>${totalCount} products</b>`,
    ].join("\n");

    const markup = { inline_keyboard: buttons };
    if (messageId) {
      try {
        const editCap = await editTelegramCaption(chatId, messageId, text, { reply_markup: markup });
        if (editCap.ok) return editCap;
      } catch {}
      try {
        return await editTelegramMessage(chatId, messageId, text, { reply_markup: markup });
      } catch {}
    }
    return sendTelegramMessage(chatId, text, { reply_markup: markup });
  } catch (err) {
    console.error("[handleCategoryOverview Error]:", err);
    return sendTelegramMessage(chatId, `❌ Error loading catalog: ${err.message}`);
  }
}

/**
 * Show a single product card with its actual photo and carousel buttons
 * callback structure: c_p:<catKey>:<index>
 */
export async function showProductCard(chatId, catKey = "ALL", index = 0, messageId = null) {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const categories = await getCategoryList(supabase);
    let categoryName = "ALL";
    if (catKey !== "ALL") {
      const idx = Number(catKey);
      categoryName = categories[idx] || "ALL";
    }

    let query = supabase
      .from("products")
      .select("id, name, price, category, outOfStock, allowcustomcolor, bestSeller, featured, isNew, images")
      .order("id", { ascending: false });

    if (categoryName !== "ALL") {
      query = query.eq("category", categoryName);
    }

    const { data: products, error } = await query;
    if (error) throw error;

    if (!products || products.length === 0) {
      const text = `📁 No products found in <b>${categoryName}</b>.`;
      const markup = {
        inline_keyboard: [[{ text: "« Back to Categories", callback_data: "m_cats" }]],
      };
      if (messageId) {
        try {
          return await editTelegramMessage(chatId, messageId, text, { reply_markup: markup });
        } catch {}
      }
      return sendTelegramMessage(chatId, text, { reply_markup: markup });
    }

    const total = products.length;
    let safeIndex = Number(index) || 0;
    if (safeIndex < 0) safeIndex = 0;
    if (safeIndex >= total) safeIndex = total - 1;

    const prod = products[safeIndex];
    const prevIdx = (safeIndex - 1 + total) % total;
    const nextIdx = (safeIndex + 1) % total;

    const stockStatus = prod.outOfStock ? "❌ Out of Stock" : "✅ In Stock";
    const customColors = prod.allowcustomcolor ? "🎨 Allowed" : "⚪ Fixed";
    const badges = [];
    if (prod.bestSeller) badges.push("⭐ Best Seller");
    if (prod.featured) badges.push("🌟 Featured");
    if (prod.isNew) badges.push("🆕 New Arrival");

    const caption = [
      `🛋️ <b>${prod.name}</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `💰 <b>Price:</b> <code>${Number(prod.price || 0).toLocaleString()} ብር</code>`,
      `🏷️ <b>Category:</b> ${prod.category || "General"}`,
      `📦 <b>Stock Status:</b> ${stockStatus}`,
      `🎨 <b>Custom Colors:</b> ${customColors}`,
      ...(badges.length > 0 ? [`🏷️ <b>Badges:</b> ${badges.join(" • ")}`] : []),
      `🆔 <b>ID:</b> <code>${prod.id}</code>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📌 <i>Item ${safeIndex + 1} of ${total} (${categoryName === "ALL" ? "All Products" : categoryName})</i>`,
    ].join("\n");

    const markup = {
      inline_keyboard: [
        [
          { text: "⬅️ Prev", callback_data: `c_p:${catKey}:${prevIdx}` },
          { text: `${safeIndex + 1} / ${total}`, callback_data: `c_sum:${catKey}` },
          { text: "Next ➡️", callback_data: `c_p:${catKey}:${nextIdx}` },
        ],
        [
          { text: "✏️ Edit Product", callback_data: `ed:${prod.id}:${catKey}:${safeIndex}` },
          {
            text: prod.outOfStock ? "🔄 Set In Stock" : "🔄 Set Out of Stock",
            callback_data: `stk:${prod.id}:${catKey}:${safeIndex}`,
          },
        ],
        [
          { text: "🗑️ Delete Product", callback_data: `del:${prod.id}:${catKey}:${safeIndex}` },
          { text: "📋 Category List", callback_data: `c_sum:${catKey}` },
        ],
        [
          { text: "« All Categories", callback_data: "m_cats" },
          { text: "« Main Menu", callback_data: "m_main" },
        ],
      ],
    };

    const firstImage = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : null;
    const photoUrl = getAbsoluteImageUrl(firstImage);

    // If an existing message exists and we have a photo, try smooth in-place update
    if (messageId && photoUrl) {
      try {
        const editMediaRes = await editTelegramMedia(chatId, messageId, photoUrl, caption, {
          reply_markup: markup,
        });
        if (editMediaRes.ok) return editMediaRes;
      } catch {}
    }

    // Otherwise send as rich photo message
    if (photoUrl) {
      try {
        const photoRes = await sendTelegramPhoto(chatId, photoUrl, caption, { reply_markup: markup });
        if (photoRes.ok) {
          if (messageId) {
            try { await deleteTelegramMessage(chatId, messageId); } catch {}
          }
          return photoRes;
        }
      } catch (err) {
        console.warn("[showProductCard Photo Warn]:", err.message);
      }
    }

    // Fallback to text message if photo fails or none available
    if (messageId) {
      try {
        const editCap = await editTelegramCaption(chatId, messageId, caption, { reply_markup: markup });
        if (editCap.ok) return editCap;
      } catch {}
      try {
        return await editTelegramMessage(chatId, messageId, caption, { reply_markup: markup });
      } catch {}
    }
    return sendTelegramMessage(chatId, caption, { reply_markup: markup });
  } catch (err) {
    console.error("[showProductCard Error]:", err);
    return sendTelegramMessage(chatId, `❌ Error loading product: ${err.message}`);
  }
}

/**
 * Text list of all products in category or grouped by category
 * callback: c_sum:<catKey>
 */
export async function showCategorySummaryList(chatId, catKey = "ALL") {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const categories = await getCategoryList(supabase);
    let categoryName = "ALL";
    if (catKey !== "ALL") {
      const idx = Number(catKey);
      categoryName = categories[idx] || "ALL";
    }

    let query = supabase
      .from("products")
      .select("id, name, price, category, outOfStock, allowcustomcolor")
      .order("id", { ascending: false });

    if (categoryName !== "ALL") {
      query = query.eq("category", categoryName);
    }

    const { data: products } = await query;
    const prods = products || [];

    const textBlocks = [];
    if (categoryName === "ALL") {
      const grouped = {};
      prods.forEach((p) => {
        const cat = p.category?.trim() || "Other";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
      });

      textBlocks.push(`📋 <b>All Showroom Products by Category</b> (${prods.length} total)`);
      textBlocks.push(`━━━━━━━━━━━━━━━━━━━━━━`);
      for (const [catName, items] of Object.entries(grouped)) {
        textBlocks.push(`\n📍 <b>${catName}</b> (${items.length} items):`);
        items.forEach((p, i) => {
          const stock = p.outOfStock ? "❌ Out of Stock" : "✅ In Stock";
          const color = p.allowcustomcolor ? "🎨" : "";
          textBlocks.push(`  ${i + 1}. <b>${p.name}</b> — <code>${Number(p.price || 0).toLocaleString()} ብር</code> (${stock} ${color})`);
        });
      }
    } else {
      textBlocks.push(`📋 <b>${categoryName}</b> (${prods.length} items)`);
      textBlocks.push(`━━━━━━━━━━━━━━━━━━━━━━`);
      prods.forEach((p, idx) => {
        const stock = p.outOfStock ? "❌ Out of Stock" : "✅ In Stock";
        const color = p.allowcustomcolor ? "🎨" : "";
        textBlocks.push(`${idx + 1}. <b>${p.name}</b> — <code>${Number(p.price || 0).toLocaleString()} ብር</code> (${stock} ${color})`);
      });
    }

    // Create fast jump-to-photo buttons for the first 8 items
    const quickButtons = prods.slice(0, 8).map((p, idx) => ({
      text: `${idx + 1}. ${p.name.slice(0, 10)}`,
      callback_data: `c_p:${catKey}:${idx}`,
    }));

    const rows = [];
    for (let i = 0; i < quickButtons.length; i += 2) {
      rows.push(quickButtons.slice(i, i + 2));
    }
    rows.push([
      { text: "🖼️ View Photos Carousel", callback_data: `c_p:${catKey}:0` },
      { text: "« Categories", callback_data: "m_cats" },
    ]);

    const fullText = textBlocks.join("\n");
    return sendTelegramMessage(chatId, fullText, { reply_markup: { inline_keyboard: rows } });
  } catch (err) {
    console.error("[showCategorySummaryList Error]:", err);
    return sendTelegramMessage(chatId, `❌ Error loading list: ${err.message}`);
  }
}

// ────────────────────────────────────────────────────────────────────
// 2. INTERACTIVE PRODUCT EDITING & LIVE TOGGLES
// ────────────────────────────────────────────────────────────────────
export async function showEditProductMenu(chatId, productId, messageId = null, catKey = "ALL", safeIndex = 0) {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const { data: prod } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (!prod) {
      return sendTelegramMessage(chatId, `❌ Product <code>${productId}</code> not found.`);
    }

    const stockText = prod.outOfStock ? "❌ Out of Stock" : "✅ In Stock";
    const colorsText = prod.allowcustomcolor ? "🎨 Custom Colors: ON" : "⚪ Custom Colors: OFF";
    const bestSellerText = prod.bestSeller ? "⭐ BestSeller: YES" : "⬜ BestSeller: NO";
    const featuredText = prod.featured ? "🌟 Featured: YES" : "⬜ Featured: NO";
    const newText = prod.isNew ? "🆕 New Arrival: YES" : "⬜ New: NO";

    const text = [
      `✏️ <b>Edit Product: ${prod.name}</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `💰 <b>Price:</b> <code>${Number(prod.price || 0).toLocaleString()} ብር</code>`,
      `🏷️ <b>Category:</b> ${prod.category || "General"}`,
      `📦 <b>Stock Status:</b> ${stockText}`,
      `🎨 <b>Color Choice:</b> ${colorsText}`,
      `⭐ <b>Best Seller:</b> ${bestSellerText}`,
      `🌟 <b>Featured:</b> ${featuredText}`,
      `🆕 <b>New Arrival:</b> ${newText}`,
      `🆔 <b>ID:</b> <code>${prod.id}</code>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `<i>Tap any toggle button below to instantly update the website:</i>`,
    ].join("\n");

    const markup = {
      inline_keyboard: [
        [
          { text: "💰 Change Price", callback_data: `prc:${prod.id}:${catKey}:${safeIndex}` },
          { text: "🏷️ Change Category", callback_data: `chcat:${prod.id}:${catKey}:${safeIndex}` },
        ],
        [
          { text: `📦 Stock: ${prod.outOfStock ? "❌ OUT" : "✅ IN"}`, callback_data: `tf:${prod.id}:outOfStock:${catKey}:${safeIndex}` },
          { text: `🎨 Colors: ${prod.allowcustomcolor ? "ON ✅" : "OFF ❌"}`, callback_data: `tf:${prod.id}:allowcustomcolor:${catKey}:${safeIndex}` },
        ],
        [
          { text: `⭐ BestSeller: ${prod.bestSeller ? "ON ✅" : "OFF ⬜"}`, callback_data: `tf:${prod.id}:bestSeller:${catKey}:${safeIndex}` },
          { text: `🌟 Featured: ${prod.featured ? "ON ✅" : "OFF ⬜"}`, callback_data: `tf:${prod.id}:featured:${catKey}:${safeIndex}` },
        ],
        [
          { text: `🆕 New: ${prod.isNew ? "ON ✅" : "OFF ⬜"}`, callback_data: `tf:${prod.id}:isNew:${catKey}:${safeIndex}` },
          { text: "🗑️ Delete Product", callback_data: `del:${prod.id}:${catKey}:${safeIndex}` },
        ],
        [
          { text: "« Back to Photos", callback_data: `c_p:${catKey}:${safeIndex}` },
          { text: "« Main Menu", callback_data: "m_main" },
        ],
      ],
    };

    if (messageId) {
      try {
        const editCap = await editTelegramCaption(chatId, messageId, text, { reply_markup: markup });
        if (editCap.ok) return editCap;
      } catch {}
      try {
        return await editTelegramMessage(chatId, messageId, text, { reply_markup: markup });
      } catch {}
    }
    return sendTelegramMessage(chatId, text, { reply_markup: markup });
  } catch (err) {
    console.error("[showEditProductMenu Error]:", err);
    return sendTelegramMessage(chatId, `❌ Failed to open edit menu: ${err.message}`);
  }
}

export async function handleToggleProductField(chatId, productId, field, catKey = "ALL", safeIndex = 0, messageId = null) {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const { data: prod } = await supabase.from("products").select(field).eq("id", productId).single();
    if (!prod) return sendTelegramMessage(chatId, `❌ Product not found.`);

    const newVal = !Boolean(prod[field]);

    // If making featured, un-feature others in same category
    if (field === "featured" && newVal === true) {
      const { data: p } = await supabase.from("products").select("category").eq("id", productId).single();
      if (p?.category) {
        await supabase.from("products").update({ featured: false }).eq("category", p.category);
      }
    }

    await supabase.from("products").update({ [field]: newVal }).eq("id", productId);
    return showEditProductMenu(chatId, productId, messageId, catKey, safeIndex);
  } catch (err) {
    console.error("[handleToggleProductField Error]:", err);
    return sendTelegramMessage(chatId, `❌ Toggle failed: ${err.message}`);
  }
}

export async function showChangeCategoryOptions(chatId, productId, catKey = "ALL", safeIndex = 0, messageId = null) {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const categories = await getCategoryList(supabase);
    const buttons = categories.map((cat, idx) => [
      { text: `📍 ${cat}`, callback_data: `scat:${productId}:${idx}:${catKey}:${safeIndex}` },
    ]);
    buttons.push([{ text: "« Back to Edit Menu", callback_data: `ed:${productId}:${catKey}:${safeIndex}` }]);

    const text = [
      `🏷️ <b>Change Category for Product</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `Select a new showroom category for <code>${productId}</code>:`,
    ].join("\n");
    const markup = { inline_keyboard: buttons };

    if (messageId) {
      try {
        const editCap = await editTelegramCaption(chatId, messageId, text, { reply_markup: markup });
        if (editCap.ok) return editCap;
      } catch {}
      try {
        return await editTelegramMessage(chatId, messageId, text, { reply_markup: markup });
      } catch {}
    }
    return sendTelegramMessage(chatId, text, { reply_markup: markup });
  } catch (err) {
    console.error("[showChangeCategoryOptions Error]:", err);
  }
}

export async function setProductCategory(chatId, productId, catIdx, catKey = "ALL", safeIndex = 0, messageId = null) {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const categories = await getCategoryList(supabase);
    const newCategory = categories[Number(catIdx)] || "Living Room";
    await supabase.from("products").update({ category: newCategory }).eq("id", productId);
    return showEditProductMenu(chatId, productId, messageId, catKey, safeIndex);
  } catch (err) {
    return sendTelegramMessage(chatId, `❌ Failed to update category: ${err.message}`);
  }
}

// ────────────────────────────────────────────────────────────────────
// 3. SAFE DELETE FUNCTIONALITY WITH CONFIRMATION
// ────────────────────────────────────────────────────────────────────
export async function promptDeleteProduct(chatId, productId, catKey = "ALL", safeIndex = 0, messageId = null) {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const { data: prod } = await supabase
      .from("products")
      .select("id, name, price, category")
      .eq("id", productId)
      .single();

    if (!prod) return sendTelegramMessage(chatId, "❌ Product not found.");

    const text = [
      `⚠️ <b>CONFIRM PERMANENT DELETION</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `Are you sure you want to delete <b>${prod.name}</b> (<code>${Number(prod.price || 0).toLocaleString()} ብር</code>)?`,
      ``,
      `📍 <b>Category:</b> ${prod.category || "General"}`,
      `🆔 <b>ID:</b> <code>${prod.id}</code>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🚨 <i>This action cannot be undone and will remove it from the website immediately.</i>`,
    ].join("\n");

    const markup = {
      inline_keyboard: [
        [{ text: "⚠️ Yes, Delete Permanently", callback_data: `cdel:${prod.id}:${catKey}:${safeIndex}` }],
        [{ text: "❌ Cancel", callback_data: `c_p:${catKey}:${safeIndex}` }],
      ],
    };

    if (messageId) {
      try {
        const editCap = await editTelegramCaption(chatId, messageId, text, { reply_markup: markup });
        if (editCap.ok) return editCap;
      } catch {}
      try {
        return await editTelegramMessage(chatId, messageId, text, { reply_markup: markup });
      } catch {}
    }
    return sendTelegramMessage(chatId, text, { reply_markup: markup });
  } catch (err) {
    console.error("[promptDeleteProduct Error]:", err);
    return sendTelegramMessage(chatId, `❌ Error: ${err.message}`);
  }
}

export async function executeDeleteProduct(chatId, productId, catKey = "ALL", safeIndex = 0, messageId = null) {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const { data: prod } = await supabase.from("products").select("name").eq("id", productId).single();
    const prodName = prod?.name || productId;

    await supabase.from("products").delete().eq("id", productId);

    const text = [
      `🗑️ <b>Product Deleted Successfully!</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `The product <b>${prodName}</b> (<code>${productId}</code>) has been permanently removed from the website catalog.`,
    ].join("\n");

    const markup = {
      inline_keyboard: [
        [{ text: "🛋️ Browse Remaining Products", callback_data: `c_p:${catKey}:0` }],
        [{ text: "« Main Menu", callback_data: "m_main" }],
      ],
    };

    if (messageId) {
      try {
        const editCap = await editTelegramCaption(chatId, messageId, text, { reply_markup: markup });
        if (editCap.ok) return editCap;
      } catch {}
      try {
        return await editTelegramMessage(chatId, messageId, text, { reply_markup: markup });
      } catch {}
    }
    return sendTelegramMessage(chatId, text, { reply_markup: markup });
  } catch (err) {
    console.error("[executeDeleteProduct Error]:", err);
    return sendTelegramMessage(chatId, `❌ Failed to delete product: ${err.message}`);
  }
}

// ────────────────────────────────────────────────────────────────────
// 4. SEAMLESS "ADD PRODUCT" WIZARD (NO CAPTIONS NEEDED!)
// ────────────────────────────────────────────────────────────────────
export async function startAddProductWizard(chatId, userId) {
  setSession(userId, {
    action: "add_product",
    step: "photo",
    data: {
      allowcustomcolor: true,
      isNew: true,
      bestSeller: false,
      featured: false,
      outOfStock: false,
    },
  });

  const text = [
    `✨ <b>Add New Product — Step 1 of 4: Photo</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📸 <b>Please send or drop the furniture photo</b> directly into this chat.`,
    ``,
    `<i>Tip: Send /cancel at any time to discard.</i>`,
  ].join("\n");

  const markup = {
    inline_keyboard: [[{ text: "❌ Cancel", callback_data: "w_cancel" }]],
  };

  return sendTelegramMessage(chatId, text, { reply_markup: markup });
}

export async function renderDraftReviewCard(chatId, userId, messageId = null) {
  const session = getSession(userId);
  if (!session || !session.data) return sendMainMenu(chatId);

  const d = session.data;
  const customColorText = d.allowcustomcolor ? "ON ✅ (Allowed)" : "OFF ⚪ (Fixed)";
  const isNewText = d.isNew ? "ON ✅" : "OFF ⬜";
  const bestSellerText = d.bestSeller ? "ON ✅" : "OFF ⬜";
  const featuredText = d.featured ? "ON ✅" : "OFF ⬜";

  const text = [
    `✨ <b>Review New Product Draft</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `🛋️ <b>Name:</b> ${d.name || "Untitled"}`,
    `💰 <b>Price:</b> <code>${Number(d.price || 0).toLocaleString()} ብር</code>`,
    `📍 <b>Category:</b> ${d.category || "Living Room"}`,
    `🎨 <b>Color Choice:</b> ${customColorText}`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `<i>Tap the toggles below to adjust options, then tap Publish:</i>`,
  ].join("\n");

  const markup = {
    inline_keyboard: [
      [
        {
          text: `🎨 Color Choice: ${d.allowcustomcolor ? "ON ✅" : "OFF ⚪"}`,
          callback_data: "w_t:color",
        },
      ],
      [
        { text: `🆕 New Arrival: ${isNewText}`, callback_data: "w_t:new" },
      ],
      [
        { text: `⭐ Best Seller: ${bestSellerText}`, callback_data: "w_t:best" },
      ],
      [
        { text: `🌟 Featured: ${featuredText}`, callback_data: "w_t:feat" },
      ],
      [
        { text: "🚀 PUBLISH TO WEBSITE", callback_data: "w_pub" },
      ],
      [
        { text: "❌ Discard Draft", callback_data: "w_cancel" },
      ],
    ],
  };

  if (messageId) {
    try {
      const editCap = await editTelegramCaption(chatId, messageId, text, { reply_markup: markup });
      if (editCap.ok) return editCap;
    } catch {}
    try {
      return await editTelegramMessage(chatId, messageId, text, { reply_markup: markup });
    } catch {}
  }
  return sendTelegramMessage(chatId, text, { reply_markup: markup });
}

export async function handleDraftToggle(chatId, userId, fieldKey, messageId = null) {
  const session = getSession(userId);
  if (!session || !session.data) return sendMainMenu(chatId);

  const fieldMap = {
    color: "allowcustomcolor",
    new: "isNew",
    best: "bestSeller",
    feat: "featured",
  };
  const actualField = fieldMap[fieldKey] || fieldKey;

  session.data[actualField] = !session.data[actualField];
  setSession(userId, session);

  return renderDraftReviewCard(chatId, userId, messageId);
}

export async function publishDraftProduct(chatId, userId, messageId = null) {
  const session = getSession(userId);
  if (!session || !session.data) return sendMainMenu(chatId);

  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  const d = session.data;
  if (!d.name || !d.price || !d.imageUrl) {
    return sendTelegramMessage(chatId, "❌ Incomplete product draft. Please start again with /addproduct.");
  }

  try {
    await sendTelegramMessage(chatId, "⏳ <i>Publishing product to website catalog...</i>");

    const slugId = `prod-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const newProduct = {
      id: slugId,
      name: d.name,
      price: Number(d.price),
      category: d.category || "Living Room",
      description: d.description || `Handcrafted ${d.name} from Kal Furniture.`,
      images: [d.imageUrl],
      outOfStock: Boolean(d.outOfStock),
      allowcustomcolor: Boolean(d.allowcustomcolor),
      isNew: Boolean(d.isNew),
      bestSeller: Boolean(d.bestSeller),
      featured: Boolean(d.featured),
      type: "Furniture",
    };

    const { error } = await supabase.from("products").insert([newProduct]);
    if (error) throw error;

    clearSession(userId);

    const successCaption = [
      `🎉 <b>Product Published Successfully!</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🛋️ <b>${newProduct.name}</b>`,
      `💰 <b>Price:</b> ${newProduct.price.toLocaleString()} ብር`,
      `📍 <b>Category:</b> ${newProduct.category}`,
      `🎨 <b>Custom Colors:</b> ${newProduct.allowcustomcolor ? "Enabled ✅" : "Disabled ⚪"}`,
      `🆔 <b>ID:</b> <code>${slugId}</code>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🔗 <i>Live now on kalefurnitures.com</i>`,
    ].join("\n");

    const markup = {
      inline_keyboard: [
        [
          { text: "✏️ Edit Product", callback_data: `ed:${slugId}:ALL:0` },
          { text: "🛋️ Browse All Photos", callback_data: "c_p:ALL:0" },
        ],
        [
          { text: "➕ Add Another Product", callback_data: "w_start" },
          { text: "« Main Menu", callback_data: "m_main" },
        ],
      ],
    };

    const photoUrl = getAbsoluteImageUrl(d.imageUrl);
    if (photoUrl) {
      try {
        return await sendTelegramPhoto(chatId, photoUrl, successCaption, { reply_markup: markup });
      } catch {}
    }
    return sendTelegramMessage(chatId, successCaption, { reply_markup: markup });
  } catch (err) {
    console.error("[publishDraftProduct Error]:", err);
    return sendTelegramMessage(chatId, `❌ Failed to publish: ${err.message}`);
  }
}

// ────────────────────────────────────────────────────────────────────
// TEXT INPUT HANDLER
// ────────────────────────────────────────────────────────────────────
export async function handleTextInput(chatId, userId, text) {
  const session = getSession(userId);
  if (!session) return null;

  const trimmed = text.trim();
  if (trimmed === "/cancel" || trimmed.toLowerCase() === "cancel") {
    clearSession(userId);
    return sendTelegramMessage(chatId, "❌ <i>Operation cancelled.</i>", {
      reply_markup: getMainKeyboard(),
    });
  }

  // 1. Edit Price of Existing Product
  if (session.action === "edit_price") {
    const cleanNum = Number(trimmed.replace(/[^0-9.]/g, ""));
    if (isNaN(cleanNum) || cleanNum <= 0) {
      return sendTelegramMessage(chatId, "❌ Please enter a valid number (e.g. <code>85000</code>). Send /cancel to abort.");
    }

    const supabase = getDbClient();
    if (supabase) {
      await supabase.from("products").update({ price: cleanNum }).eq("id", session.productId);
    }
    const catKey = session.catKey || "ALL";
    const safeIndex = session.safeIndex || 0;
    const prodId = session.productId;
    clearSession(userId);

    await sendTelegramMessage(chatId, `✅ <b>Price updated to ${cleanNum.toLocaleString()} ብር!</b>`);
    return showEditProductMenu(chatId, prodId, null, catKey, safeIndex);
  }

  // Edit Promo Banner Field
  if (session.action === "edit_promo_field") {
    const field = session.field;
    const supabase = getDbClient();
    if (supabase) {
      const promo = await getPromoSettings(supabase);
      promo[field] = trimmed;
      await savePromoSettings(supabase, promo);
    }
    clearSession(userId);
    const fieldLabels = {
      title: "Headline Title",
      subtitle: "Subtitle Description",
      buttonText: "Button Text",
      buttonLink: "Button Link",
    };
    await sendTelegramMessage(chatId, `✅ <b>Promo Banner ${fieldLabels[field] || field} updated successfully!</b>`);
    return handlePromo(chatId);
  }

  // 2. Add Product Wizard Steps
  if (session.action === "add_product") {
    if (session.step === "name") {
      session.data.name = trimmed;
      session.step = "price";
      setSession(userId, session);

      return sendTelegramMessage(
        chatId,
        [
          `🛋️ Name set to: <b>${trimmed}</b>`,
          `━━━━━━━━━━━━━━━━━━━━━━`,
          `💰 <b>Enter the price in ETB:</b>`,
          `<i>(e.g. 85000)</i>`,
        ].join("\n")
      );
    }

    if (session.step === "price") {
      const cleanPrice = Number(trimmed.replace(/[^0-9.]/g, ""));
      if (isNaN(cleanPrice) || cleanPrice <= 0) {
        return sendTelegramMessage(chatId, "❌ Please enter a valid numeric price (e.g. <code>85000</code>).");
      }

      session.data.price = cleanPrice;
      session.step = "category";
      setSession(userId, session);

      const supabase = getDbClient();
      let categories = ["Living Room", "Dining Area", "Bedroom", "Office"];
      if (supabase) {
        categories = await getCategoryList(supabase);
      }

      const buttons = categories.map((cat, idx) => [
        { text: `📍 ${cat}`, callback_data: `w_cat:${idx}` },
      ]);
      buttons.push([
        { text: "✏️ Custom Category", callback_data: "w_custom_cat" },
      ]);
      buttons.push([
        { text: "❌ Cancel", callback_data: "w_cancel" },
      ]);

      return sendTelegramMessage(
        chatId,
        [
          `💰 Price set to: <b>${cleanPrice.toLocaleString()} ብር</b>`,
          `━━━━━━━━━━━━━━━━━━━━━━`,
          `🏷️ <b>Select Showroom Category:</b>`,
          `Tap a category button below:`,
        ].join("\n"),
        { reply_markup: { inline_keyboard: buttons } }
      );
    }

    if (session.step === "custom_category") {
      session.data.category = trimmed;
      session.step = "review";
      setSession(userId, session);

      return renderDraftReviewCard(chatId, userId);
    }
  }

  return null;
}

// ────────────────────────────────────────────────────────────────────
// PHOTO UPLOAD HANDLER
// ────────────────────────────────────────────────────────────────────
export async function handleIncomingPhoto(chatId, userId, photoArray) {
  const largestPhoto = photoArray[photoArray.length - 1];
  const fileUrl = await getTelegramFileUrl(largestPhoto.file_id);
  if (!fileUrl) {
    return sendTelegramMessage(chatId, "❌ Failed to download photo from Telegram.");
  }

  try {
    const imgRes = await fetch(fileUrl, { signal: AbortSignal.timeout(15000) });
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    const fileName = `tg-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.jpg`;
    const localUploadDir = path.join(process.cwd(), "public", "uploads", "products");

    if (!fs.existsSync(localUploadDir)) {
      fs.mkdirSync(localUploadDir, { recursive: true });
    }

    fs.writeFileSync(path.join(localUploadDir, fileName), imgBuffer);
    const localPublicUrl = `/uploads/products/${fileName}`;

    // Initialize session immediately with local image so the user has zero waiting time
    setSession(userId, {
      action: "add_product",
      step: "name",
      data: {
        imageUrl: localPublicUrl,
        allowcustomcolor: true,
        isNew: true,
        bestSeller: false,
        featured: false,
        outOfStock: false,
      },
    });

    // Upload to cPanel in the background (fire-and-forget async update to session)
    const cpanelUploadUrl = process.env.NEXT_PUBLIC_CPANEL_UPLOAD_URL;
    const cpanelSecret = process.env.NEXT_PUBLIC_CPANEL_UPLOAD_SECRET;
    if (cpanelUploadUrl && cpanelSecret) {
      (async () => {
        try {
          const formData = new FormData();
          formData.append("secret", cpanelSecret);
          formData.append("folder", "products");
          formData.append("file", new Blob([imgBuffer], { type: "image/jpeg" }), fileName);

          const cpRes = await fetch(cpanelUploadUrl, {
            method: "POST",
            body: formData,
            signal: AbortSignal.timeout(30000),
          });
          if (cpRes.ok) {
            const cpData = await cpRes.json();
            if (cpData.url) {
              const currentSession = getSession(userId);
              if (currentSession && currentSession.data) {
                currentSession.data.imageUrl = cpData.url;
                setSession(userId, currentSession);
              }
            }
          }
        } catch (cpErr) {
          console.warn("[Background cPanel Upload Warn]:", cpErr.message);
        }
      })();
    }

    const text = [
      `📸 <b>Photo Saved Successfully!</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🛋️ <b>What is the name or code of this product?</b>`,
      `<i>Reply with the name (e.g. Emerald Chesterfield Sofa or KDT-008):</i>`,
      ``,
      `<i>(Send /cancel to discard at any time)</i>`,
    ].join("\n");

    const markup = {
      inline_keyboard: [[{ text: "❌ Cancel", callback_data: "w_cancel" }]],
    };

    return sendTelegramMessage(chatId, text, { reply_markup: markup });
  } catch (err) {
    console.error("[handleIncomingPhoto Error]:", err);
    return sendTelegramMessage(chatId, `❌ Failed to process photo: ${err.message}`);
  }
}

// ────────────────────────────────────────────────────────────────────
// SHOWROOM ANALYTICS & STATS
// ────────────────────────────────────────────────────────────────────
export async function handleStats(chatId, messageId = null) {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const { data: prods } = await supabase.from("products").select("price, outOfStock, allowcustomcolor");
    const { data: inqs } = await supabase.from("inquiries").select("id, status, created_at");

    const totalProducts = (prods || []).length;
    const inStock = (prods || []).filter((p) => !p.outOfStock).length;
    const outOfStock = (prods || []).filter((p) => p.outOfStock).length;
    const customColorsCount = (prods || []).filter((p) => p.allowcustomcolor).length;
    const totalInventoryValue = (prods || []).reduce((sum, p) => sum + (Number(p.price) || 0), 0);

    const totalInquiries = (inqs || []).length;
    const pendingInquiries = (inqs || []).filter((i) => i.status === "pending" || !i.status).length;

    const text = [
      `📊 <b>Kal Furniture — Live Performance Analytics</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🛋️ <b>Total Products:</b> ${totalProducts}`,
      `✅ <b>In Stock:</b> ${inStock}`,
      `❌ <b>Out of Stock:</b> ${outOfStock}`,
      `🎨 <b>Custom Color Enabled:</b> ${customColorsCount}`,
      `💰 <b>Total Catalog Value:</b> <code>${totalInventoryValue.toLocaleString()} ብር</code>`,
      ``,
      `📬 <b>Inquiries / Orders:</b> ${totalInquiries} total (${pendingInquiries} pending)`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🌐 <i>Website: kalefurnitures.com</i>`,
    ].join("\n");

    const markup = {
      inline_keyboard: [
        [
          { text: "🛋️ Browse Photos", callback_data: "c_p:ALL:0" },
          { text: "📦 View Inquiries", callback_data: "m_orders" },
        ],
        [{ text: "« Back to Main Menu", callback_data: "m_main" }],
      ],
    };

    if (messageId) {
      try {
        const editCap = await editTelegramCaption(chatId, messageId, text, { reply_markup: markup });
        if (editCap.ok) return editCap;
      } catch {}
      try {
        return await editTelegramMessage(chatId, messageId, text, { reply_markup: markup });
      } catch {}
    }
    return sendTelegramMessage(chatId, text, { reply_markup: markup });
  } catch (err) {
    console.error("[handleStats Error]:", err);
    return sendTelegramMessage(chatId, `❌ Failed to fetch stats: ${err.message}`);
  }
}

// ────────────────────────────────────────────────────────────────────
// RECENT INQUIRIES
// ────────────────────────────────────────────────────────────────────
export async function handleOrders(chatId, messageId = null) {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const { data: inqs, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!inqs || inqs.length === 0) {
      const emptyText = "📦 <b>No recent customer inquiries found.</b>";
      const markup = {
        inline_keyboard: [[{ text: "« Back to Main Menu", callback_data: "m_main" }]],
      };
      if (messageId) {
        try {
          return await editTelegramMessage(chatId, messageId, emptyText, { reply_markup: markup });
        } catch {}
      }
      return sendTelegramMessage(chatId, emptyText, { reply_markup: markup });
    }

    const cards = inqs.map((inq, idx) => {
      const date = inq.created_at ? new Date(inq.created_at).toLocaleDateString() : "Recent";
      return [
        `<b>#${idx + 1} — ${inq.full_name || inq.name || "Customer"}</b> (${date})`,
        `📞 Phone: <code>${inq.phone || "N/A"}</code>`,
        `🛋️ Item: ${inq.product_name || inq.product || "Custom Order"}`,
        inq.color ? `🎨 Color: ${inq.color}` : "",
        `💬 Notes: <i>${inq.message || inq.notes || "No message"}</i>`,
      ].filter(Boolean).join("\n");
    });

    const text = [
      `📦 <b>Latest Customer Inquiries & Quotes</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      cards.join("\n\n"),
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `Tap below to return to Main Menu:`,
    ].join("\n");

    const markup = {
      inline_keyboard: [
        [
          { text: "📊 Showroom Analytics", callback_data: "m_stats" },
          { text: "« Main Menu", callback_data: "m_main" },
        ],
      ],
    };

    if (messageId) {
      try {
        const editCap = await editTelegramCaption(chatId, messageId, text, { reply_markup: markup });
        if (editCap.ok) return editCap;
      } catch {}
      try {
        return await editTelegramMessage(chatId, messageId, text, { reply_markup: markup });
      } catch {}
    }
    return sendTelegramMessage(chatId, text, { reply_markup: markup });
  } catch (err) {
    console.error("[handleOrders Error]:", err);
    return sendTelegramMessage(chatId, `❌ Failed to fetch inquiries: ${err.message}`);
  }
}

// ────────────────────────────────────────────────────────────────────
// PROMO BANNER MANAGEMENT (Synced with site_settings.promo_banner)
// ────────────────────────────────────────────────────────────────────
export async function getPromoSettings(supabase) {
  const { data: row } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "promo_banner")
    .maybeSingle();

  const val = row?.value || {};
  const isEnabled = val.enabled !== undefined ? Boolean(val.enabled) : (val.active !== undefined ? Boolean(val.active) : true);
  return {
    enabled: isEnabled,
    active: isEnabled,
    title: val.title || "በ 130,000 ብር ብቻ ቤቶን ያሟሉ!",
    subtitle: val.subtitle || "ሶፋ ፣ አልጋ ፣ ፍራሽ ፣ ሲንተር ቴብል እና ቲቪ ስታንድ በ 130,000 ብር ብቻ",
    buttonText: val.buttonText || "ገብተው ይዩት!",
    buttonLink: val.buttonLink || "/packages",
    image: val.image || "/assets/img/hero/beige-chair.jpeg",
    bgColor: val.bgColor || "#DFD2C1",
  };
}

export async function savePromoSettings(supabase, promo) {
  const updatedValue = {
    ...promo,
    enabled: Boolean(promo.enabled),
    active: Boolean(promo.enabled),
  };
  const { data, error } = await supabase.from("site_settings").upsert(
    {
      key: "promo_banner",
      value: updatedValue,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
  if (error) {
    console.error("[savePromoSettings Error]:", error);
    throw error;
  }
  return { data };
}

export async function handlePromo(chatId, messageId = null) {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const promo = await getPromoSettings(supabase);

    const statusBadge = promo.enabled
      ? "🟢 <b>ACTIVE</b> (Live on Website Homepage)"
      : "🔴 <b>HIDDEN</b> (Disabled on Website)";

    const text = [
      `📢 <b>Website Promotional Banner Manager</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `<b>Status:</b> ${statusBadge}`,
      ``,
      `📌 <b>Headline Title:</b>`,
      `<i>"${promo.title}"</i>`,
      ``,
      `📝 <b>Subtitle:</b>`,
      `<i>"${promo.subtitle}"</i>`,
      ``,
      `🔘 <b>Action Button:</b>`,
      `[ ${promo.buttonText} ] ➔ <code>${promo.buttonLink}</code>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `<i>Tap a button below to toggle visibility or edit text:</i>`,
    ].join("\n");

    const markup = {
      inline_keyboard: [
        [
          {
            text: promo.enabled ? "🔴 Turn Banner OFF (Hide)" : "🟢 Turn Banner ON (Show Live)",
            callback_data: "m_tpromo",
          },
        ],
        [
          { text: "✏️ Change Title", callback_data: "p_edit:title" },
          { text: "📝 Change Subtitle", callback_data: "p_edit:subtitle" },
        ],
        [
          { text: "🔘 Change Button Text", callback_data: "p_edit:buttonText" },
          { text: "🔗 Change Button Link", callback_data: "p_edit:buttonLink" },
        ],
        [{ text: "« Back to Main Menu", callback_data: "m_main" }],
      ],
    };

    if (messageId) {
      const editMsg = await editTelegramMessage(chatId, messageId, text, { reply_markup: markup });
      if (editMsg?.ok) return editMsg;
      const editCap = await editTelegramCaption(chatId, messageId, text, { reply_markup: markup });
      if (editCap?.ok) return editCap;
      try { await deleteTelegramMessage(chatId, messageId); } catch {}
    }
    return sendTelegramMessage(chatId, text, { reply_markup: markup });
  } catch (err) {
    console.error("[handlePromo Error]:", err);
    return sendTelegramMessage(chatId, `❌ Error loading promo banner: ${err.message}`);
  }
}

export async function handleTogglePromo(chatId, messageId = null) {
  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const promo = await getPromoSettings(supabase);
    const newStatus = !promo.enabled;
    promo.enabled = newStatus;
    promo.active = newStatus;

    await savePromoSettings(supabase, promo);
    return handlePromo(chatId, messageId);
  } catch (err) {
    console.error("[handleTogglePromo Error]:", err);
    return sendTelegramMessage(chatId, `❌ Failed to toggle promo banner: ${err.message}`);
  }
}

export async function handleSetPromo(chatId, newText) {
  if (!newText) {
    return sendTelegramMessage(chatId, "❌ Usage: <code>/setpromo &lt;your announcement title&gt;</code>");
  }

  const supabase = getDbClient();
  if (!supabase) return sendTelegramMessage(chatId, "❌ Database unavailable.");

  try {
    const promo = await getPromoSettings(supabase);
    promo.title = newText;
    promo.enabled = true;
    promo.active = true;

    await savePromoSettings(supabase, promo);

    await sendTelegramMessage(
      chatId,
      `✅ <b>Website promo banner updated & turned ON!</b>\n\n📌 <b>Title:</b> "${newText}"`
    );
    return handlePromo(chatId);
  } catch (err) {
    console.error("[handleSetPromo Error]:", err);
    return sendTelegramMessage(chatId, `❌ Failed to update promo: ${err.message}`);
  }
}

// ────────────────────────────────────────────────────────────────────
// HELP GUIDE
// ────────────────────────────────────────────────────────────────────
export async function handleHelp(chatId, messageId = null) {
  const text = [
    `📖 <b>Kal Furniture Telegram Bot — Complete Guide</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `<b>✨ Seamless Product Adding:</b>`,
    `• Simply send any furniture <b>photo</b> directly to the bot!`,
    `• Or tap <code>➕ Add New Product</code> to be guided step-by-step.`,
    `• You will be prompted for Name and Price, choose a Category with buttons, and set Color & Feature toggles interactively!`,
    ``,
    `<b>🛋️ Catalog & Photo Inspection:</b>`,
    `• Tap <code>🛋️ Browse Products & Photos</code> to view all categories.`,
    `• Browse products with full photos, price, stock, and color options.`,
    ``,
    `<b>✏️ Editing & Stock Controls:</b>`,
    `• Under any product photo, tap <code>✏️ Edit Product</code> to:`,
    `  - Change Price`,
    `  - Change Category`,
    `  - Toggle Stock (In / Out of Stock)`,
    `  - Toggle Custom Color choices (Allow / Disallow)`,
    `  - Toggle Best Seller or Featured badges`,
    ``,
    `<b>🗑️ Permanent Deletion:</b>`,
    `• Tap <code>🗑️ Delete Product</code> with safety confirmation.`,
    ``,
    `<b>Commands:</b>`,
    `• <code>/menu</code> — Main control dashboard`,
    `• <code>/products</code> — Browse products & photos by category`,
    `• <code>/addproduct</code> — Start product creation wizard`,
    `• <code>/stats</code> — Live showroom revenue and numbers`,
    `• <code>/orders</code> — Latest customer inquiries`,
    `• <code>/promo</code> — Website announcement banner`,
    `• <code>/cancel</code> — Abort any active input session`,
  ].join("\n");

  const markup = {
    inline_keyboard: [[{ text: "« Back to Main Menu", callback_data: "m_main" }]],
  };

  if (messageId) {
    try {
      const editCap = await editTelegramCaption(chatId, messageId, text, { reply_markup: markup });
      if (editCap.ok) return editCap;
    } catch {}
    try {
      return await editTelegramMessage(chatId, messageId, text, { reply_markup: markup });
    } catch {}
  }
  return sendTelegramMessage(chatId, text, { reply_markup: markup });
}

// ────────────────────────────────────────────────────────────────────
// MAIN UPDATE ROUTER (COMPACT CALLBACKS < 64 BYTES)
// ────────────────────────────────────────────────────────────────────
export async function handleTelegramUpdate(update) {
  if (!update) return;

  // 1. CALLBACK QUERIES (BUTTON CLICKS)
  if (update.callback_query) {
    const { id: callbackId, from, data, message } = update.callback_query;
    const userId = from?.id;
    const chatId = message?.chat?.id;
    const messageId = message?.message_id;

    if (!(await isAuthorizedAdmin(userId))) {
      await answerCallbackQuery(callbackId, "⛔ Access Denied. Admin only.", true);
      return;
    }

    await answerCallbackQuery(callbackId);

    // Cancel Wizard
    if (data === "w_cancel") {
      clearSession(userId);
      return sendMainMenu(chatId);
    }

    // Main Menu
    if (data === "m_main") {
      return sendMainMenu(chatId, messageId);
    }

    // Analytics & Stats
    if (data === "m_stats") {
      return handleStats(chatId, messageId);
    }

    // Recent Orders
    if (data === "m_orders") {
      return handleOrders(chatId, messageId);
    }

    // Categories Overview
    if (data === "m_cats") {
      return handleCategoryOverview(chatId, messageId);
    }

    // View Product Card in Carousel: c_p:<catKey>:<idx>
    if (data.startsWith("c_p:")) {
      const parts = data.split(":");
      const catKey = parts[1] || "ALL";
      const idx = Number(parts[2]) || 0;
      return showProductCard(chatId, catKey, idx, messageId);
    }

    // Category Summary List: c_sum:<catKey>
    if (data.startsWith("c_sum:")) {
      const catKey = data.split(":")[1] || "ALL";
      return showCategorySummaryList(chatId, catKey);
    }

    // Quick Stock Toggle: stk:<prodId>:<catKey>:<idx>
    if (data.startsWith("stk:")) {
      const parts = data.split(":");
      const prodId = parts[1];
      const catKey = parts[2] || "ALL";
      const idx = Number(parts[3]) || 0;

      const supabase = getDbClient();
      if (supabase) {
        const { data: p } = await supabase.from("products").select("outOfStock").eq("id", prodId).single();
        if (p) {
          await supabase.from("products").update({ outOfStock: !p.outOfStock }).eq("id", prodId);
        }
      }
      return showProductCard(chatId, catKey, idx, messageId);
    }

    // Start Add Product Wizard
    if (data === "w_start") {
      return startAddProductWizard(chatId, userId);
    }

    // Wizard Category Selection: w_cat:<catIdx>
    if (data.startsWith("w_cat:")) {
      const catIdx = Number(data.split(":")[1]);
      const supabase = getDbClient();
      let categories = ["Living Room", "Dining Area", "Bedroom", "Office"];
      if (supabase) categories = await getCategoryList(supabase);

      const chosen = categories[catIdx] || "Living Room";
      const session = getSession(userId);
      if (session) {
        session.data.category = chosen;
        session.step = "review";
        setSession(userId, session);
        return renderDraftReviewCard(chatId, userId);
      }
    }

    // Wizard Custom Category Prompt
    if (data === "w_custom_cat") {
      const session = getSession(userId);
      if (session) {
        session.step = "custom_category";
        setSession(userId, session);
        return sendTelegramMessage(chatId, "✍️ Please type the name of the new custom category in chat:");
      }
    }

    // Wizard Toggles: w_t:<color|new|best|feat>
    if (data.startsWith("w_t:")) {
      const fieldKey = data.split(":")[1];
      return handleDraftToggle(chatId, userId, fieldKey, messageId);
    }

    // Wizard Publish
    if (data === "w_pub") {
      return publishDraftProduct(chatId, userId, messageId);
    }

    // Edit Product Menu: ed:<prodId>:<catKey>:<idx>
    if (data.startsWith("ed:")) {
      const parts = data.split(":");
      const prodId = parts[1];
      const catKey = parts[2] || "ALL";
      const idx = Number(parts[3]) || 0;
      return showEditProductMenu(chatId, prodId, messageId, catKey, idx);
    }

    // Toggle Field on Existing Product: tf:<prodId>:<field>:<catKey>:<idx>
    if (data.startsWith("tf:")) {
      const parts = data.split(":");
      const prodId = parts[1];
      const field = parts[2];
      const catKey = parts[3] || "ALL";
      const idx = Number(parts[4]) || 0;
      return handleToggleProductField(chatId, prodId, field, catKey, idx, messageId);
    }

    // Edit Price of Existing Product: prc:<prodId>:<catKey>:<idx>
    if (data.startsWith("prc:")) {
      const parts = data.split(":");
      const prodId = parts[1];
      const catKey = parts[2] || "ALL";
      const idx = Number(parts[3]) || 0;
      setSession(userId, {
        action: "edit_price",
        productId: prodId,
        catKey,
        safeIndex: idx,
      });
      return sendTelegramMessage(
        chatId,
        `💰 <b>Enter the new price</b> in ETB for product <code>${prodId}</code>:\n(e.g. <code>85000</code>, or send /cancel to abort)`
      );
    }

    // Change Category of Existing Product: chcat:<prodId>:<catKey>:<idx>
    if (data.startsWith("chcat:")) {
      const parts = data.split(":");
      const prodId = parts[1];
      const catKey = parts[2] || "ALL";
      const idx = Number(parts[3]) || 0;
      return showChangeCategoryOptions(chatId, prodId, catKey, idx, messageId);
    }

    // Set Category of Existing Product: scat:<prodId>:<catIdx>:<catKey>:<idx>
    if (data.startsWith("scat:")) {
      const parts = data.split(":");
      const prodId = parts[1];
      const catIdx = parts[2];
      const catKey = parts[3] || "ALL";
      const idx = Number(parts[4]) || 0;
      return setProductCategory(chatId, prodId, catIdx, catKey, idx, messageId);
    }

    // Prompt Delete Confirmation: del:<prodId>:<catKey>:<idx>
    if (data.startsWith("del:")) {
      const parts = data.split(":");
      const prodId = parts[1];
      const catKey = parts[2] || "ALL";
      const idx = Number(parts[3]) || 0;
      return promptDeleteProduct(chatId, prodId, catKey, idx, messageId);
    }

    // Confirm Permanent Delete: cdel:<prodId>:<catKey>:<idx>
    if (data.startsWith("cdel:")) {
      const parts = data.split(":");
      const prodId = parts[1];
      const catKey = parts[2] || "ALL";
      const idx = Number(parts[3]) || 0;
      return executeDeleteProduct(chatId, prodId, catKey, idx, messageId);
    }

    // Promo Banner
    if (data === "m_promo") {
      return handlePromo(chatId, messageId);
    }
    if (data === "m_tpromo") {
      return handleTogglePromo(chatId, messageId);
    }
    if (data.startsWith("p_edit:")) {
      const field = data.replace("p_edit:", "").trim();
      const fieldLabels = {
        title: "Headline Title",
        subtitle: "Subtitle Description",
        buttonText: "Button Text",
        buttonLink: "Button Link (e.g. /packages)",
      };
      setSession(userId, {
        action: "edit_promo_field",
        field,
      });
      return sendTelegramMessage(
        chatId,
        `✍️ <b>Enter the new ${fieldLabels[field] || field}</b> for the website promo banner:\n\n<i>(Type your text in chat, or send /cancel to abort)</i>`
      );
    }

    // Help
    if (data === "m_help") {
      return handleHelp(chatId, messageId);
    }

    return;
  }

  // 2. MESSAGES
  const message = update.message;
  if (!message) return;

  const userId = message.from?.id;
  const chatId = message.chat?.id;

  if (!(await isAuthorizedAdmin(userId))) {
    console.warn(`[Telegram Security] Unauthorized access attempt by user ID: ${userId}`);
    return sendTelegramMessage(
      chatId,
      `⛔ <b>Access Denied</b>\nYour Telegram User ID (<code>${userId}</code>) is not authorized.\nContact the administrator to add your ID.`
    );
  }

  // Photo received -> Auto Start Add Product Wizard!
  if (message.photo && Array.isArray(message.photo) && message.photo.length > 0) {
    return handleIncomingPhoto(chatId, userId, message.photo);
  }

  const text = (message.text || "").trim();
  if (!text) return;

  // Active session text input handler
  const sessionResult = await handleTextInput(chatId, userId, text);
  if (sessionResult) return sessionResult;

  // Slash Commands
  if (text === "/start" || text === "/menu") {
    clearSession(userId);
    return sendMainMenu(chatId);
  }
  if (text === "/cancel") {
    clearSession(userId);
    return sendTelegramMessage(chatId, "❌ <i>No active session to cancel.</i>", {
      reply_markup: getMainKeyboard(),
    });
  }
  if (text === "/help") {
    return handleHelp(chatId);
  }
  if (text === "/stats" || text === "/dashboard") {
    return handleStats(chatId);
  }
  if (text === "/orders" || text === "/inquiries") {
    return handleOrders(chatId);
  }
  if (text === "/addproduct" || text === "/add") {
    return startAddProductWizard(chatId, userId);
  }
  if (text.startsWith("/products") || text.startsWith("/catalog")) {
    return handleCategoryOverview(chatId);
  }
  if (text === "/list" || text.startsWith("/list ")) {
    return showCategorySummaryList(chatId, "ALL");
  }
  if (text.startsWith("/delete")) {
    const prodId = text.replace(/^\/delete\s*/i, "").trim();
    if (!prodId) return sendTelegramMessage(chatId, "❌ Usage: <code>/delete &lt;product_id&gt;</code>");
    return promptDeleteProduct(chatId, prodId, "ALL", 0);
  }
  if (text.startsWith("/edit")) {
    const prodId = text.replace(/^\/edit\s*/i, "").trim();
    if (!prodId) return sendTelegramMessage(chatId, "❌ Usage: <code>/edit &lt;product_id&gt;</code>");
    return showEditProductMenu(chatId, prodId, null, "ALL", 0);
  }
  if (text === "/promo") {
    return handlePromo(chatId);
  }
  if (text.startsWith("/setpromo")) {
    const promoText = text.replace(/^\/setpromo\s*/i, "").trim();
    return handleSetPromo(chatId, promoText);
  }
  if (text === "/togglepromo") {
    return handleTogglePromo(chatId);
  }

  return sendMainMenu(chatId);
}
