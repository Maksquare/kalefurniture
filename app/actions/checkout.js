"use server";
 
import { getServiceRoleClient, getSupabasePublicClient } from "@/lib/supabase-admin";
import { notifyAdminsOnNewOrder } from "@/lib/telegram";

export async function incrementSalesCount(cartItems) {
  try {
    const supabase = getServiceRoleClient() || getSupabasePublicClient();
    if (!supabase) {
      console.warn("[incrementSalesCount] Supabase client not configured.");
      return { success: false, error: "Database client not configured." };
    }

    if (!cartItems || cartItems.length === 0) return { success: true };

    // 1. Update sales_count on each product
    for (const item of cartItems) {
      if (!item.id) continue;
      try {
        const { data: product, error: fetchError } = await supabase
          .from('products')
          .select('sales_count')
          .eq('id', item.id)
          .single();
          
        if (fetchError) {
          console.warn(`[incrementSalesCount] Error fetching sales_count for product ${item.id}:`, fetchError.message);
          continue;
        }
        
        const currentSales = product?.sales_count || 0;
        const newSales = currentSales + (item.quantity || 1);
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ sales_count: newSales })
          .eq('id', item.id);
          
        if (updateError) {
          console.warn(`[incrementSalesCount] Error updating sales_count for product ${item.id}:`, updateError.message);
        }
      } catch (prodErr) {
        console.warn(`[incrementSalesCount] Failed to update product ${item.id}:`, prodErr.message);
      }
    }

    // 2. Record the order in the orders table for revenue reporting
    const totalEtb = cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
      0
    );
    const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const orderSnapshot = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      selectedColor: item.selectedColor || null,
    }));

    const { error: orderError } = await supabase
      .from('orders')
      .insert([{
        total_etb: totalEtb,
        item_count: itemCount,
        items: orderSnapshot,
        status: 'completed',
      }]);

    if (orderError) {
      console.warn("[incrementSalesCount] Failed to insert order row:", orderError.message);
    } else {
      // Send real-time instant alert to Telegram Admin
      try {
        await notifyAdminsOnNewOrder({
          totalEtb,
          itemCount,
          items: orderSnapshot,
        });
      } catch (tgErr) {
        console.warn("[incrementSalesCount] Telegram order alert failed:", tgErr.message);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("[incrementSalesCount] Error:", error.message);
    return { success: false, error: error.message || "Failed to update sales counts" };
  }
}

