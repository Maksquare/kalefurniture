"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { allProducts as initialProducts } from "@/lib/data";
import { serverAddProduct, serverUpdateProduct, serverDeleteProduct } from "@/app/actions/admin";
import { setCookie, getCookieJson } from "@/lib/cookies";
import { broadcastChange, subscribeToBroadcast, initSupabaseRealtime } from "@/lib/realtimeSync";
import { resolveImageUrl } from "@/lib/imageUtils";
import toast from "react-hot-toast";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Instant Cache from LocalStorage or Cookies
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kal_products");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProducts(parsed.map(p => ({
            ...p,
            images: Array.isArray(p.images) ? p.images.map(resolveImageUrl) : (p.images ? [resolveImageUrl(p.images)] : []),
          })));
        } catch (e) {
          setProducts(initialProducts);
        }
      } else {
        setProducts(initialProducts);
      }
    }

    // 2. Fetch products from Supabase
    async function fetchProducts() {
      const supabase = getSupabase();
      if (!supabase) {
        setIsLoaded(true);
        return;
      }
      
      try {
        let { data, error } = await supabase.from('products').select('*').order('id', { ascending: false });
        if (error) {
          console.warn("[ProductContext] Ordering by id failed, retrying without order:", error.message);
          const fallback = await supabase.from('products').select('*');
          data = fallback.data;
          error = fallback.error;
        }

        if (error) {
          console.warn("[ProductContext] Error fetching products from Supabase:", error.message);
        } else if (data && data.length > 0) {
          const normalized = data.map(p => ({
            ...p,
            images: Array.isArray(p.images) ? p.images.map(resolveImageUrl) : (p.images ? [resolveImageUrl(p.images)] : []),
            allowcustomcolor: p.allowcustomcolor === false ? false : Boolean(p.allowcustomcolor),
          }));
          setProducts(normalized);
          if (typeof window !== "undefined") {
            localStorage.setItem("kal_products", JSON.stringify(normalized));
          }
          setCookie("kal_products_sync", { count: normalized.length, timestamp: Date.now() }, 30);
        }
      } catch (error) {
        console.error("[ProductContext] Error fetching products:", error.message);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchProducts();

    // 3. Realtime Cross-tab Broadcast Listener (Changes in /admin reflect live on / without reload)
    const unsubscribeBroadcast = subscribeToBroadcast((event) => {
      if (!event || !event.type) return;

      if (event.type === "PRODUCTS_UPDATED" && Array.isArray(event.payload)) {
        console.log("[ProductContext Realtime] Received live products list update");
        setProducts(event.payload);
        if (typeof window !== "undefined") {
          localStorage.setItem("kal_products", JSON.stringify(event.payload));
        }
      } else if (event.type === "PRODUCT_MUTATED" && event.payload) {
        const { eventType, new: newRow, old: oldRow } = event.payload;
        console.log("[ProductContext Realtime] Database mutation:", eventType);
        
        if (eventType === "INSERT" && newRow) {
          setProducts((prev) => {
            if (prev.some(p => p.id === newRow.id)) return prev;
            return [{
              ...newRow,
              allowcustomcolor: newRow.allowcustomcolor === false ? false : Boolean(newRow.allowcustomcolor),
            }, ...prev];
          });
        } else if (eventType === "UPDATE" && newRow) {
          setProducts((prev) => prev.map(p => p.id === newRow.id ? {
            ...p,
            ...newRow,
            allowcustomcolor: newRow.allowcustomcolor === false ? false : Boolean(newRow.allowcustomcolor),
          } : p));
        } else if (eventType === "DELETE" && oldRow) {
          setProducts((prev) => prev.filter(p => p.id !== oldRow.id));
        }
      }
    });

    // 4. Supabase Database-level Realtime Postgres Changes
    const unsubscribeSupabase = initSupabaseRealtime({
      onProductChange: (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        if (eventType === "INSERT" && newRow) {
          setProducts((prev) => {
            if (prev.some(p => p.id === newRow.id)) return prev;
            return [{
              ...newRow,
              allowcustomcolor: newRow.allowcustomcolor === false ? false : Boolean(newRow.allowcustomcolor),
            }, ...prev];
          });
        } else if (eventType === "UPDATE" && newRow) {
          setProducts((prev) => prev.map(p => p.id === newRow.id ? {
            ...p,
            ...newRow,
            allowcustomcolor: newRow.allowcustomcolor === false ? false : Boolean(newRow.allowcustomcolor),
          } : p));
        } else if (eventType === "DELETE" && oldRow) {
          setProducts((prev) => prev.filter(p => p.id !== oldRow.id));
        }
      },
    });

    return () => {
      unsubscribeBroadcast();
      unsubscribeSupabase();
    };
  }, []);

  const addProduct = async (newProduct) => {
    const supabase = getSupabase();
    const tempId = newProduct.id || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const productWithId = { ...newProduct, id: tempId };
    
    // 1. Instant Optimistic State Update
    let updatedList;
    setProducts((prev) => {
      const filtered = productWithId.featured
        ? prev.map(p => p.category === productWithId.category ? { ...p, featured: false } : p)
        : prev;
      updatedList = [productWithId, ...filtered];
      return updatedList;
    });

    // 2. Instant Cookie & LocalStorage Sync
    setCookie("kal_products_sync", { count: updatedList?.length || 0, timestamp: Date.now() }, 30);
    if (typeof window !== "undefined") {
      localStorage.setItem("kal_products", JSON.stringify(updatedList || []));
    }

    // 3. Realtime Cross-tab Broadcast
    broadcastChange("PRODUCTS_UPDATED", updatedList);

    // 4. Asynchronous Database Write
    (async () => {
      let success = false;
      try {
        const result = await serverAddProduct(productWithId);
        if (result && result.success) {
          success = true;
          if (result.data?.id) {
            // Update tempId to real ID if returned
            setProducts(prev => prev.map(p => p.id === tempId ? { ...p, id: result.data.id } : p));
          }
        }
      } catch (e) {
        console.warn("[ProductContext] Server action add failed, falling back to direct insert:", e.message);
      }

      if (!success && supabase) {
        try {
          const payload = {
            ...productWithId,
            allowcustomcolor: productWithId.allowCustomColor !== undefined 
              ? Boolean(productWithId.allowCustomColor) 
              : (productWithId.allowcustomcolor !== undefined ? Boolean(productWithId.allowcustomcolor) : true),
          };
          delete payload.showInHero;
          delete payload.allowCustomColor;
          delete payload.allow_custom_color;
          const { error } = await supabase.from('products').insert([payload]);
          if (error) throw error;
        } catch (err) {
          console.error("[ProductContext] Direct insert failed:", err.message);
          toast.error(err.message || "Failed to sync product with database");
        }
      }
    })();

    toast.success("Product added successfully");
  };

  const updateProduct = async (id, updatedData) => {
    const supabase = getSupabase();

    // 1. Instant Optimistic State Update
    let updatedList;
    setProducts((prev) => {
      let list = prev;
      if (updatedData.featured === true) {
        const category = updatedData.category || prev.find(p => p.id === id)?.category;
        list = prev.map(p => (p.category === category && p.id !== id) ? { ...p, featured: false } : p);
      }
      updatedList = list.map((p) => (p.id === id ? { ...p, ...updatedData } : p));
      return updatedList;
    });

    // 2. Instant Cookie & LocalStorage Sync
    setCookie("kal_products_sync", { count: updatedList?.length || 0, timestamp: Date.now() }, 30);
    if (typeof window !== "undefined") {
      localStorage.setItem("kal_products", JSON.stringify(updatedList || []));
    }

    // 3. Realtime Cross-tab Broadcast
    broadcastChange("PRODUCTS_UPDATED", updatedList);

    // 4. Asynchronous Database Write
    (async () => {
      let success = false;
      try {
        const result = await serverUpdateProduct(id, updatedData);
        if (result && result.success) {
          success = true;
        }
      } catch (e) {
        console.warn("[ProductContext] Server action update failed, falling back to direct update:", e.message);
      }

      if (!success && supabase) {
        try {
          const payload = {
            ...updatedData,
            allowcustomcolor: updatedData.allowCustomColor !== undefined 
              ? Boolean(updatedData.allowCustomColor) 
              : (updatedData.allowcustomcolor !== undefined ? Boolean(updatedData.allowcustomcolor) : true),
          };
          delete payload.showInHero;
          delete payload.allowCustomColor;
          delete payload.allow_custom_color;
          const { error } = await supabase.from('products').update(payload).eq('id', id);
          if (error) throw error;
        } catch (err) {
          console.error("[ProductContext] Direct update failed:", err.message);
          toast.error(err.message || "Failed to sync update with database");
        }
      }
    })();

    toast.success("Product updated successfully");
  };

  const deleteProduct = async (id) => {
    const supabase = getSupabase();

    // 1. Instant Optimistic State Update
    let updatedList;
    setProducts((prev) => {
      updatedList = prev.filter((p) => p.id !== id);
      return updatedList;
    });

    // 2. Instant Cookie & LocalStorage Sync
    setCookie("kal_products_sync", { count: updatedList?.length || 0, timestamp: Date.now() }, 30);
    if (typeof window !== "undefined") {
      localStorage.setItem("kal_products", JSON.stringify(updatedList || []));
    }

    // 3. Realtime Cross-tab Broadcast
    broadcastChange("PRODUCTS_UPDATED", updatedList);

    // 4. Asynchronous Database Write
    (async () => {
      let success = false;
      try {
        const result = await serverDeleteProduct(id);
        if (result && result.success) {
          success = true;
        }
      } catch (e) {
        console.warn("[ProductContext] Server action delete failed, falling back to direct delete:", e.message);
      }

      if (!success && supabase) {
        try {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) throw error;
        } catch (err) {
          console.error("[ProductContext] Direct delete failed:", err.message);
          toast.error(err.message || "Failed to delete product from database");
        }
      }
    })();

    toast.success("Product deleted successfully");
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, isLoaded }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
