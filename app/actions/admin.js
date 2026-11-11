"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient, getSupabasePublicClient } from "@/lib/supabase-admin";

function revalidateSite() {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/collections");
    revalidatePath("/packages");
    revalidatePath("/admin");
    revalidatePath("/admin/hero");
  } catch (e) {
    // Non-critical in headless or test execution
  }
}

// Security check helper — uses admin_token cookie set at login
async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token?.value) {
    throw new Error("Unauthorized: Admin access required.");
  }
}

async function getAdminDb() {
  const client = await getSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase Admin client not configured.");
  }
  return client;
}

// ------------------------------------------------------------------
// AUTH / SESSION
// ------------------------------------------------------------------

export async function serverSetAdminSession(accessToken) {
  try {
    if (!accessToken) {
      return { success: false, error: "Missing access token" };
    }
    const cookieStore = await cookies();
    cookieStore.set("admin_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });
    return { success: true, redirectUrl: "/admin" };
  } catch (error) {
    console.error("[serverSetAdminSession] Error:", error.message);
    return { success: false, error: error.message || "Failed to start admin session" };
  }
}

// ------------------------------------------------------------------
// PRODUCTS
// ------------------------------------------------------------------

export async function serverAddProduct(newProduct) {
  try {
    await checkAdmin();
    const supabase = await getAdminDb();
    
    const payload = {
      ...newProduct,
      // Use exact Supabase column name (all lowercase)
      allowcustomcolor: newProduct.allowCustomColor !== undefined 
        ? Boolean(newProduct.allowCustomColor) 
        : (newProduct.allowcustomcolor !== undefined ? Boolean(newProduct.allowcustomcolor) : true),
    };
    // Remove camelCase aliases that don't exist as DB columns
    delete payload.showInHero;
    delete payload.allowCustomColor;
    delete payload.allow_custom_color;

    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select();
      
    if (error) {
      console.warn("[serverAddProduct] Insert with extended fields failed, retrying with base fields:", error.message);
      const basePayload = {
        id: payload.id,
        name: payload.name,
        price: payload.price,
        description: payload.description,
        category: payload.category,
        type: payload.type,
        images: payload.images,
        featured: payload.featured,
        bestSeller: payload.bestSeller,
        isNew: payload.isNew,
        outOfStock: payload.outOfStock,
        swatches: payload.swatches,
        allowcustomcolor: payload.allowcustomcolor,
        structure: payload.structure,
        finish: payload.finish,
        dimensions: payload.dimensions,
      };
      Object.keys(basePayload).forEach(key => basePayload[key] === undefined && delete basePayload[key]);

      const { data: retryData, error: retryError } = await supabase
        .from("products")
        .insert([basePayload])
        .select();

      if (retryError) throw retryError;
      revalidateSite();
      return { success: true, data: retryData };
    }

    revalidateSite();
    return { success: true, data };
  } catch (error) {
    console.error("[serverAddProduct] Error:", error.message);
    return { success: false, error: error.message || "Failed to add product" };
  }
}

export async function serverUpdateProduct(id, updatedData) {
  try {
    await checkAdmin();
    const supabase = await getAdminDb();
    
    const payload = {
      ...updatedData,
      // Use exact Supabase column name (all lowercase)
      allowcustomcolor: updatedData.allowCustomColor !== undefined 
        ? Boolean(updatedData.allowCustomColor) 
        : (updatedData.allowcustomcolor !== undefined ? Boolean(updatedData.allowcustomcolor) : true),
    };
    // Remove camelCase aliases that don't exist as DB columns
    delete payload.showInHero;
    delete payload.allowCustomColor;
    delete payload.allow_custom_color;

    // If we are setting this product to featured, we need to un-feature others in the category
    if (payload.featured === true) {
      let category = payload.category;
      if (!category) {
        const { data: p } = await supabase.from("products").select("category").eq("id", id).single();
        category = p?.category;
      }
      
      if (category) {
        await supabase
          .from("products")
          .update({ featured: false })
          .eq("category", category)
          .neq("id", id);
      }
    }

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select();
      
    if (error) {
      console.warn("[serverUpdateProduct] Update with extended fields failed, retrying with base fields:", error.message);
      const basePayload = {
        name: payload.name,
        price: payload.price,
        description: payload.description,
        category: payload.category,
        type: payload.type,
        images: payload.images,
        featured: payload.featured,
        bestSeller: payload.bestSeller,
        isNew: payload.isNew,
        outOfStock: payload.outOfStock,
        swatches: payload.swatches,
        allowcustomcolor: payload.allowcustomcolor,
        structure: payload.structure,
        finish: payload.finish,
        dimensions: payload.dimensions,
      };
      Object.keys(basePayload).forEach(key => basePayload[key] === undefined && delete basePayload[key]);

      const { data: retryData, error: retryError } = await supabase
        .from("products")
        .update(basePayload)
        .eq("id", id)
        .select();

      if (retryError) throw retryError;
      revalidateSite();
      return { success: true, data: retryData };
    }

    revalidateSite();
    return { success: true, data };
  } catch (error) {
    console.error("[serverUpdateProduct] Error:", error.message);
    return { success: false, error: error.message || "Failed to update product" };
  }
}

export async function serverDeleteProduct(id) {
  try {
    await checkAdmin();
    const supabase = await getAdminDb();
    
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    revalidateSite();
    return { success: true };
  } catch (error) {
    console.error("[serverDeleteProduct] Error:", error.message);
    return { success: false, error: error.message || "Failed to delete product" };
  }
}

// ------------------------------------------------------------------
// PACKAGES
// ------------------------------------------------------------------

export async function serverAddPackage(newPackage) {
  try {
    await checkAdmin();
    const supabase = await getAdminDb();
    
    const { data, error } = await supabase
      .from("packages")
      .insert([newPackage])
      .select();
      
    if (error) throw error;
    revalidateSite();
    return { success: true, data };
  } catch (error) {
    console.error("[serverAddPackage] Error:", error.message);
    return { success: false, error: error.message || "Failed to add package" };
  }
}

export async function serverUpdatePackage(id, updatedData) {
  try {
    await checkAdmin();
    const supabase = await getAdminDb();
    
    const { data, error } = await supabase
      .from("packages")
      .update(updatedData)
      .eq("id", id)
      .select();
      
    if (error) throw error;
    revalidateSite();
    return { success: true, data };
  } catch (error) {
    console.error("[serverUpdatePackage] Error:", error.message);
    return { success: false, error: error.message || "Failed to update package" };
  }
}

export async function serverDeletePackage(id) {
  try {
    await checkAdmin();
    const supabase = await getAdminDb();
    
    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    revalidateSite();
    return { success: true };
  } catch (error) {
    console.error("[serverDeletePackage] Error:", error.message);
    return { success: false, error: error.message || "Failed to delete package" };
  }
}

// ------------------------------------------------------------------
// SALES REPORT
// ------------------------------------------------------------------

export async function fetchSalesReport() {
  try {
    await checkAdmin();
    const supabase = await getAdminDb();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // 1. Fetch top products & products sales
    let allProducts = [];
    let topProducts = [];
    try {
      const { data: prods, error: prodErr } = await supabase
        .from("products")
        .select("id, name, category, price, sales_count, images")
        .order("sales_count", { ascending: false });

      if (!prodErr && Array.isArray(prods)) {
        allProducts = prods;
        topProducts = prods.slice(0, 5);
      }
    } catch (e) {
      console.warn("[fetchSalesReport] Error fetching products:", e.message);
    }

    // 2. Fetch orders from orders table
    let allOrders = [];
    try {
      const { data: ordersData, error: ordersErr } = await supabase
        .from("orders")
        .select("id, total_etb, item_count, created_at");

      if (!ordersErr && Array.isArray(ordersData)) {
        allOrders = ordersData;
      } else if (ordersErr) {
        console.warn("[fetchSalesReport] Orders table query notice:", ordersErr.message);
      }
    } catch (e) {
      console.warn("[fetchSalesReport] Error querying orders table:", e.message);
    }

    // Compute metrics
    const ordersCount = allOrders.length;
    const ordersRevenue = allOrders.reduce((s, o) => s + (Number(o.total_etb) || 0), 0);

    const productSalesCount = allProducts.reduce((s, p) => s + (Number(p.sales_count) || 0), 0);
    const productSalesRevenue = allProducts.reduce(
      (s, p) => s + (Number(p.price) || 0) * (Number(p.sales_count) || 0),
      0
    );

    // Total orders and revenue: take the best available data
    const totalOrders = Math.max(ordersCount, productSalesCount);
    const totalRevenue = Math.max(ordersRevenue, productSalesRevenue);

    // This month metrics
    const thisMonthOrdersList = allOrders.filter((o) => o.created_at && o.created_at >= startOfMonth);
    const thisMonthOrdersCount = thisMonthOrdersList.length;
    let thisMonthRevenue = thisMonthOrdersList.reduce((s, o) => s + (Number(o.total_etb) || 0), 0);

    if (thisMonthRevenue === 0 && totalRevenue > 0 && ordersCount === 0) {
      // If orders table is empty but products have sales, estimate recent revenue
      thisMonthRevenue = totalRevenue;
    }

    // Last 6 months revenue bar chart
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();

      let revenue = allOrders
        .filter((o) => o.created_at && o.created_at >= monthStart && o.created_at <= monthEnd)
        .reduce((s, o) => s + (Number(o.total_etb) || 0), 0);

      // If this is current month and orders table had no rows but product revenue exists
      if (i === 0 && revenue === 0 && monthlyRevenue.every(m => m.revenue === 0) && totalRevenue > 0) {
        revenue = totalRevenue;
      }

      monthlyRevenue.push({ label, revenue });
    }

    return {
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        thisMonthOrders: thisMonthOrdersCount || (totalOrders > 0 ? totalOrders : 0),
        thisMonthRevenue,
        monthlyRevenue,
        topProducts,
      },
    };
  } catch (error) {
    console.error("[fetchSalesReport] Error:", error.message);
    return { success: false, error: error.message || "Failed to fetch sales report" };
  }
}

// ------------------------------------------------------------------
// SITE SETTINGS (Promo Banner, Hero, etc.)
// ------------------------------------------------------------------

export async function serverSaveSiteSetting(key, value) {
  try {
    await checkAdmin();
    const supabase = await getAdminDb();
    const cookieStore = await cookies();

    const { data, error } = await supabase
      .from("site_settings")
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      )
      .select();

    if (error) throw error;

    // Persist settings in cookies for instantaneous SSR hydration
    try {
      if (key === "hero_settings") {
        cookieStore.set("kal_hero_settings", encodeURIComponent(JSON.stringify(value)), { path: "/", maxAge: 60 * 60 * 24 * 30 });
      } else if (key === "promo_banner") {
        cookieStore.set("kal_promo_settings", encodeURIComponent(JSON.stringify(value)), { path: "/", maxAge: 60 * 60 * 24 * 30 });
      }
      cookieStore.set("kal_site_sync", String(Date.now()), { path: "/", maxAge: 60 * 60 * 24 * 30 });
    } catch (cookieErr) {}

    revalidateSite();
    return { success: true, data };
  } catch (error) {
    console.error("[serverSaveSiteSetting] Error:", error.message);
    return { success: false, error: error.message || "Failed to save site setting" };
  }
}

export async function serverGetSiteSettings() {
  try {
    const supabase = getSupabasePublicClient();
    if (!supabase) throw new Error("Supabase client not configured.");

    const { data, error } = await supabase
      .from("site_settings")
      .select("*");

    if (error) throw error;

    const settingsMap = {};
    if (data) {
      data.forEach((row) => {
        settingsMap[row.key] = row.value;
      });
    }
    return { success: true, data: settingsMap };
  } catch (error) {
    console.error("[serverGetSiteSettings] Error:", error.message);
    return { success: false, error: error.message || "Failed to fetch site settings" };
  }
}

export async function fetchHeroAndPromoData() {
  try {
    const cookieStore = await cookies();
    const cookieHero = cookieStore.get("kal_hero_settings")?.value;
    const cookiePromo = cookieStore.get("kal_promo_settings")?.value;

    let fallbackHero = null;
    let fallbackPromo = null;

    if (cookieHero) {
      try { fallbackHero = JSON.parse(decodeURIComponent(cookieHero)); } catch (e) {}
    }
    if (cookiePromo) {
      try { fallbackPromo = JSON.parse(decodeURIComponent(cookiePromo)); } catch (e) {}
    }

    const supabase = getSupabasePublicClient();
    if (!supabase) return { heroProduct: null, promoSettings: fallbackPromo, heroSettings: fallbackHero };

    const { data: settingsData } = await supabase.from("site_settings").select("*");
    const settingsMap = {};
    if (settingsData) {
      settingsData.forEach((row) => {
        settingsMap[row.key] = row.value;
      });
    }

    let heroProduct = settingsMap.hero_product_data || null;

    if (!heroProduct && settingsMap.hero_product_id) {
      const { data: prod } = await supabase
        .from("products")
        .select("*")
        .eq("id", settingsMap.hero_product_id)
        .single();
      if (prod) heroProduct = prod;
    }

    if (!heroProduct) {
      const { data: featuredProds } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .limit(1);
      if (featuredProds?.length) heroProduct = featuredProds[0];
    }

    return {
      heroProduct,
      promoSettings: settingsMap.promo_banner || fallbackPromo,
      heroSettings: settingsMap.hero_settings || fallbackHero,
    };
  } catch (err) {
    console.error("[fetchHeroAndPromoData] Error:", err.message);
    return { heroProduct: null, promoSettings: null, heroSettings: null };
  }
}

// ------------------------------------------------------------------
// CATEGORIES
// ------------------------------------------------------------------

export async function serverGetCategories() {
  try {
    const supabase = getSupabasePublicClient();
    if (!supabase) return { success: true, data: null };

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "catalog_categories")
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.warn("[serverGetCategories] Error:", error.message);
    }

    return { success: true, data: data?.value || null };
  } catch (error) {
    console.error("[serverGetCategories] Error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function serverSaveCategories(categories) {
  try {
    await checkAdmin();
    const supabase = await getAdminDb();
    const cookieStore = await cookies();

    const { data, error } = await supabase
      .from("site_settings")
      .upsert(
        { key: "catalog_categories", value: categories, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      )
      .select();

    if (error) throw error;

    try {
      cookieStore.set("kal_categories", encodeURIComponent(JSON.stringify(categories)), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    } catch (cookieErr) {}

    revalidateSite();
    try {
      revalidatePath("/admin/categories");
    } catch (e) {}

    return { success: true, data };
  } catch (error) {
    console.error("[serverSaveCategories] Error:", error.message);
    return { success: false, error: error.message || "Failed to save categories" };
  }
}

// ------------------------------------------------------------------
// TELEGRAM ADMINS MANAGEMENT
// ------------------------------------------------------------------

export async function serverGetTelegramAdmins() {
  try {
    await checkAdmin();
    const supabase = await getAdminDb();

    // 1. Fetch DB admins
    const { data: dbRow, error } = await supabase
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", "telegram_admins")
      .maybeSingle();

    if (error) {
      console.warn("[serverGetTelegramAdmins] Query error:", error.message);
    }

    const rawDbAdmins = Array.isArray(dbRow?.value) ? dbRow.value : [];
    const dbAdminList = rawDbAdmins
      .map((item) => {
        if (typeof item === "string") {
          return {
            telegramId: item.trim(),
            name: "Staff Admin",
            role: "Admin",
            isEnv: false,
            isRemovable: true,
            addedAt: dbRow?.updated_at || null,
          };
        }
        return {
          telegramId: String(item.telegramId || item.id || "").trim(),
          name: item.name || "Staff Admin",
          role: item.role || "Admin",
          isEnv: false,
          isRemovable: true,
          addedAt: item.addedAt || dbRow?.updated_at || null,
        };
      })
      .filter((a) => Boolean(a.telegramId));

    // 2. Fetch env IDs (Primary Super-Admins)
    const envIds = (process.env.TELEGRAM_ADMIN_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const envAdminList = envIds.map((id) => ({
      telegramId: id,
      name: id === "6305668197" ? "Maksquare (Primary Owner)" : "System Super-Admin",
      role: "Owner / Super-Admin",
      isEnv: true,
      isRemovable: false,
      addedAt: "Permanent (.env)",
    }));

    // Merge: env admins first, then DB admins that are not duplicate
    const seenIds = new Set(envIds);
    const combinedAdmins = [...envAdminList];
    for (const a of dbAdminList) {
      if (!seenIds.has(a.telegramId)) {
        seenIds.add(a.telegramId);
        combinedAdmins.push(a);
      }
    }

    // 3. Bot info
    let botInfo = { username: "KalFurnitureAdminBot", firstName: "Kal Furniture Admin", ok: true };
    try {
      const { getTelegramBotInfo } = await import("@/lib/telegram");
      botInfo = await getTelegramBotInfo();
    } catch {}

    return {
      success: true,
      admins: combinedAdmins,
      botInfo,
      totalCount: combinedAdmins.length,
    };
  } catch (error) {
    console.error("[serverGetTelegramAdmins] Error:", error.message);
    return { success: false, error: error.message || "Failed to load telegram admins" };
  }
}

export async function serverAddTelegramAdmin({ telegramId, name, role, sendWelcome = true }) {
  try {
    await checkAdmin();
    const cleanId = String(telegramId || "").trim();

    // Validate ID
    if (!cleanId || !/^-?\d+$/.test(cleanId)) {
      return {
        success: false,
        error: "Invalid Telegram ID. It must be numeric (e.g. 6305668197).",
      };
    }

    // Check env duplicates
    const envIds = (process.env.TELEGRAM_ADMIN_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (envIds.includes(cleanId)) {
      return {
        success: false,
        error: `Telegram ID ${cleanId} is already authorized as a primary super-admin.`,
      };
    }

    const supabase = await getAdminDb();

    // Fetch current DB list
    const { data: dbRow } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "telegram_admins")
      .maybeSingle();

    const currentList = Array.isArray(dbRow?.value) ? dbRow.value : [];
    const exists = currentList.some((item) => {
      const id = typeof item === "string" ? item : item.telegramId || item.id;
      return String(id).trim() === cleanId;
    });

    if (exists) {
      return {
        success: false,
        error: `Telegram ID ${cleanId} is already authorized.`,
      };
    }

    const newAdminObj = {
      telegramId: cleanId,
      name: (name || "Staff Admin").trim(),
      role: (role || "Admin").trim(),
      addedAt: new Date().toISOString(),
    };

    const updatedList = [...currentList, newAdminObj];

    const { error: saveErr } = await supabase
      .from("site_settings")
      .upsert(
        {
          key: "telegram_admins",
          value: updatedList,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (saveErr) throw saveErr;

    // Clear cache immediately
    try {
      const { clearAdminIdsCache, sendTelegramMessage } = await import("@/lib/telegram");
      clearAdminIdsCache();

      // Send welcome message on Telegram if requested
      if (sendWelcome) {
        await sendTelegramMessage(
          cleanId,
          [
            `🎉 <b>Welcome to Kal Furniture Admin!</b>`,
            `━━━━━━━━━━━━━━━━━━━━━━`,
            `Hello <b>${newAdminObj.name}</b>, your Telegram account has been authorized with <b>${newAdminObj.role}</b> privileges.`,
            ``,
            `👉 <b>Send /start or /menu</b> to open the Kal Furniture Command Studio directly from your phone!`,
          ].join("\n")
        );
      }
    } catch (e) {
      console.warn("[serverAddTelegramAdmin] Post-save notification warning:", e.message);
    }

    return {
      success: true,
      message: `Admin "${newAdminObj.name}" (${cleanId}) successfully authorized!`,
      admin: newAdminObj,
    };
  } catch (error) {
    console.error("[serverAddTelegramAdmin] Error:", error.message);
    return { success: false, error: error.message || "Failed to authorize Telegram admin." };
  }
}

export async function serverRemoveTelegramAdmin(telegramId) {
  try {
    await checkAdmin();
    const cleanId = String(telegramId || "").trim();

    // Verify not env admin
    const envIds = (process.env.TELEGRAM_ADMIN_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (envIds.includes(cleanId)) {
      return {
        success: false,
        error: "Cannot remove primary environment admin. Update TELEGRAM_ADMIN_IDS in .env.local to change.",
      };
    }

    const supabase = await getAdminDb();

    const { data: dbRow } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "telegram_admins")
      .maybeSingle();

    const currentList = Array.isArray(dbRow?.value) ? dbRow.value : [];
    const updatedList = currentList.filter((item) => {
      const id = typeof item === "string" ? item : item.telegramId || item.id;
      return String(id).trim() !== cleanId;
    });

    const { error: saveErr } = await supabase
      .from("site_settings")
      .upsert(
        {
          key: "telegram_admins",
          value: updatedList,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (saveErr) throw saveErr;

    // Clear cache immediately
    try {
      const { clearAdminIdsCache } = await import("@/lib/telegram");
      clearAdminIdsCache();
    } catch {}

    return { success: true, message: `Telegram Admin ${cleanId} removed.` };
  } catch (error) {
    console.error("[serverRemoveTelegramAdmin] Error:", error.message);
    return { success: false, error: error.message || "Failed to remove Telegram admin." };
  }
}

export async function serverSendTestPingToAdmin(telegramId) {
  try {
    await checkAdmin();
    const cleanId = String(telegramId || "").trim();
    const { sendTelegramMessage } = await import("@/lib/telegram");

    const text = [
      `⚡ <b>Kal Furniture Admin Ping Test</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `✅ <b>Status:</b> Connected & Authorized`,
      `🆔 <b>Chat ID:</b> <code>${cleanId}</code>`,
      `⏰ <b>Server Time:</b> ${new Date().toLocaleTimeString()} (Addis Ababa)`,
      ``,
      `Your bot permissions are fully active. You can send /menu at any time.`,
    ].join("\n");

    const res = await sendTelegramMessage(cleanId, text);
    if (!res || !res.ok) {
      return {
        success: false,
        error: res?.description || "Telegram returned an error. Ensure the user has pressed /start in the bot chat.",
      };
    }

    return { success: true, message: `Ping sent successfully to Telegram ID ${cleanId}!` };
  } catch (error) {
    console.error("[serverSendTestPingToAdmin] Error:", error.message);
    return { success: false, error: error.message || "Failed to send test ping." };
  }
}

export async function serverSyncTelegramWebhook() {
  try {
    await checkAdmin();
    const { setTelegramWebhook, setTelegramCommands, setTelegramChatMenuButton } = await import("@/lib/telegram");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kalefurnitures.com";
    const webhookUrl = `${siteUrl.replace(/\/$/, "")}/api/telegram`;
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET || "";

    const res = await setTelegramWebhook(webhookUrl, secret);
    await setTelegramCommands();
    await setTelegramChatMenuButton();

    return {
      success: true,
      webhookUrl,
      result: res,
    };
  } catch (error) {
    console.error("[serverSyncTelegramWebhook] Error:", error.message);
    return { success: false, error: error.message || "Failed to sync webhook." };
  }
}
