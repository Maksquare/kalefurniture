"use server";

import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Security check helper
async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token) {
    throw new Error("Unauthorized: Admin access required.");
  }
}

// ------------------------------------------------------------------
// PRODUCTS
// ------------------------------------------------------------------

export async function serverAddProduct(newProduct) {
  try {
    await checkAdmin();
    if (!supabaseAdmin) throw new Error("Supabase Admin client not configured.");
    
    const { data, error } = await supabaseAdmin
      .from("products")
      .insert([newProduct])
      .select();
      
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("[serverAddProduct] Error:", error.message);
    return { success: false, error: error.message || "Failed to add product" };
  }
}

export async function serverUpdateProduct(id, updatedData) {
  try {
    await checkAdmin();
    if (!supabaseAdmin) throw new Error("Supabase Admin client not configured.");
    
    // If we are setting this product to featured, we need to un-feature others in the category
    if (updatedData.featured === true) {
      let category = updatedData.category;
      if (!category) {
        const { data: p } = await supabaseAdmin.from("products").select("category").eq("id", id).single();
        category = p?.category;
      }
      
      if (category) {
        await supabaseAdmin
          .from("products")
          .update({ featured: false })
          .eq("category", category)
          .neq("id", id);
      }
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(updatedData)
      .eq("id", id)
      .select();
      
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("[serverUpdateProduct] Error:", error.message);
    return { success: false, error: error.message || "Failed to update product" };
  }
}

export async function serverDeleteProduct(id) {
  try {
    await checkAdmin();
    if (!supabaseAdmin) throw new Error("Supabase Admin client not configured.");
    
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
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
    if (!supabaseAdmin) throw new Error("Supabase Admin client not configured.");
    
    const { data, error } = await supabaseAdmin
      .from("packages")
      .insert([newPackage])
      .select();
      
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("[serverAddPackage] Error:", error.message);
    return { success: false, error: error.message || "Failed to add package" };
  }
}

export async function serverUpdatePackage(id, updatedData) {
  try {
    await checkAdmin();
    if (!supabaseAdmin) throw new Error("Supabase Admin client not configured.");
    
    const { data, error } = await supabaseAdmin
      .from("packages")
      .update(updatedData)
      .eq("id", id)
      .select();
      
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("[serverUpdatePackage] Error:", error.message);
    return { success: false, error: error.message || "Failed to update package" };
  }
}

export async function serverDeletePackage(id) {
  try {
    await checkAdmin();
    if (!supabaseAdmin) throw new Error("Supabase Admin client not configured.");
    
    const { error } = await supabaseAdmin
      .from("packages")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
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
    if (!supabaseAdmin) throw new Error("Supabase Admin client not configured.");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // --- KPIs: all-time totals from orders table ---
    const { data: allOrders, error: allErr } = await supabaseAdmin
      .from("orders")
      .select("id, total_etb, item_count, created_at");

    if (allErr) throw allErr;

    const totalOrders = allOrders?.length || 0;
    const totalRevenue = allOrders?.reduce((s, o) => s + (o.total_etb || 0), 0) || 0;

    // --- This month ---
    const thisMonthOrders = allOrders?.filter((o) => o.created_at >= startOfMonth) || [];
    const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + (o.total_etb || 0), 0);

    // --- Last 6 months revenue bar chart ---
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const monthEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const revenue = allOrders
        ?.filter((o) => o.created_at >= monthStart && o.created_at <= monthEnd)
        .reduce((s, o) => s + (o.total_etb || 0), 0) || 0;
      monthlyRevenue.push({ label, revenue });
    }

    // --- Top 5 products by sales_count ---
    const { data: topProducts, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("id, name, category, price, sales_count, images")
      .order("sales_count", { ascending: false })
      .limit(5);

    if (prodErr) throw prodErr;

    return {
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        thisMonthOrders: thisMonthOrders.length,
        thisMonthRevenue,
        monthlyRevenue,
        topProducts: topProducts || [],
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
    if (!supabaseAdmin) throw new Error("Supabase Admin client not configured.");

    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("[serverSaveSiteSetting] Error:", error.message);
    return { success: false, error: error.message || "Failed to save site setting" };
  }
}

export async function serverGetSiteSettings() {
  try {
    if (!supabaseAdmin) throw new Error("Supabase Admin client not configured.");

    const { data, error } = await supabaseAdmin
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
    if (!supabaseAdmin) return { heroProduct: null, promoSettings: null };

    const { data: settingsData } = await supabaseAdmin.from("site_settings").select("*");
    const settingsMap = {};
    if (settingsData) {
      settingsData.forEach((row) => {
        settingsMap[row.key] = row.value;
      });
    }

    let heroProduct = settingsMap.hero_product_data || null;

    if (!heroProduct && settingsMap.hero_product_id) {
      const { data: prod } = await supabaseAdmin
        .from("products")
        .select("*")
        .eq("id", settingsMap.hero_product_id)
        .single();
      if (prod) heroProduct = prod;
    }

    if (!heroProduct) {
      const { data: featuredProds } = await supabaseAdmin
        .from("products")
        .select("*")
        .eq("featured", true)
        .limit(1);
      if (featuredProds?.length) heroProduct = featuredProds[0];
    }

    return {
      heroProduct,
      promoSettings: settingsMap.promo_banner || null,
    };
  } catch (err) {
    console.error("[fetchHeroAndPromoData] Error:", err.message);
    return { heroProduct: null, promoSettings: null };
  }
}



