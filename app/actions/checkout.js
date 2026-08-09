"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function incrementSalesCount(cartItems) {
  try {
    if (!supabaseAdmin) {
      console.warn("Supabase Admin client not configured. Skipping sales count update.");
      return { success: false, error: "Database client not configured." };
    }

    if (!cartItems || cartItems.length === 0) return { success: true };

    // 1. Update sales_count on each product
    for (const item of cartItems) {
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
      
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({ sales_count: newSales })
        .eq('id', item.id);
        
      if (updateError) {
        console.error(`Error updating sales_count for product ${item.id}:`, updateError.message);
      }
    }

    // 2. Record the order in the orders table for revenue reporting
    const totalEtb = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const orderSnapshot = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
    }));

    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        total_etb: totalEtb,
        item_count: itemCount,
        items: orderSnapshot,
        status: 'completed',
      }]);

    if (orderError) {
      // Non-fatal — sales_count already updated; just log the order insert failure
      console.error("[incrementSalesCount] Failed to insert order row:", orderError.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error("[incrementSalesCount] Error:", error.message);
    return { success: false, error: error.message || "Failed to update sales counts" };
  }
}
