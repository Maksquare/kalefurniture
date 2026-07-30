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
