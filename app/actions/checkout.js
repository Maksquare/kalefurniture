"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function incrementSalesCount(cartItems) {
  try {
    if (!supabaseAdmin) {
      console.warn("Supabase Admin client not configured. Skipping sales count update.");
      return { success: false, error: "Database client not configured." };
    }

    if (!cartItems || cartItems.length === 0) return { success: true };

    for (const item of cartItems) {
      // 1. Fetch current sales_count
      const { data: product, error: fetchError } = await supabaseAdmin
        .from('products')
        .select('sales_count')
        .eq('id', item.id)
        .single();
        
      if (fetchError) {
        console.error(`Error fetching sales_count for product ${item.id}:`, fetchError.message);
        continue;
      }
      
      const currentSales = product?.sales_count || 0;
      const newSales = currentSales + (item.quantity || 1);
      
      // 2. Update with new count
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ sales_count: newSales })
        .eq('id', item.id);
        
      if (updateError) {
        console.error(`Error updating sales_count for product ${item.id}:`, updateError.message);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("[incrementSalesCount] Error:", error.message);
    return { success: false, error: error.message || "Failed to update sales counts" };
  }
}
