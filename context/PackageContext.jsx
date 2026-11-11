"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { serverAddPackage, serverUpdatePackage, serverDeletePackage } from "@/app/actions/admin";
import { setCookie, getCookieJson } from "@/lib/cookies";
import { broadcastChange, subscribeToBroadcast, initSupabaseRealtime } from "@/lib/realtimeSync";
import { resolveImageUrl } from "@/lib/imageUtils";
import toast from "react-hot-toast";

const initialPackages = [
  {
    id: "pkg-1",
    name: "KAL SIGNATURE",
    collection: "COMPLETE HOME BUNDLE",
    description: "The ultimate curated collection. Transform your entire living space with our premium selection of matching, high-end pieces.",
    mainImage: "/assets/img/hero/beige-chair.jpeg",
    bgColor: "#FAF8F5",
    accentColor: "#6B2B31",
    items: [
      {
        name: "LIVING ROOM SOFA",
        specs: { Width: "240 cm", Depth: "95 cm", Height: "75 cm", "Seat": "42 cm", Fabric: "Textured Bouclé", Legs: "Lacquered Wood" },
        image: "/assets/img/hero/beige-chair.jpeg"
      },
      {
        name: "DINING TABLE & SEATS",
        specs: { Width: "200 cm", Depth: "100 cm", Height: "76 cm", Seats: "6 Persons", Material: "Solid Oak", Finish: "Matte" },
        image: "/assets/img/living-room/living-room-13.jpg"
      },
      {
        name: "CENTER TABLE",
        specs: { Diameter: "100 cm", Height: "40 cm", Top: "Travertine Marble", Base: "Brushed Brass" },
        image: "/assets/img/living-room/living-room-4.png"
      },
      {
        name: "LUXURY BED",
        specs: { Size: "King", Width: "180 cm", Length: "200 cm", Material: "Linen Blend", Frame: "Solid Ash" },
        image: "/assets/img/living-room/living-room-2.jpg"
      }
    ],
    price: 200000
  },
  {
    id: "pkg-2",
    name: "MINIMALIST HAVEN",
    collection: "ESSENTIALS COLLECTION",
    description: "Clean lines and understated elegance. Create a tranquil environment where less is truly more.",
    mainImage: "/assets/img/living-room/living-room-12.jpg",
    bgColor: "#F0F0F0",
    accentColor: "#2A2A2A",
    items: [
      {
        name: "MINIMALIST LOUNGE SOFA",
        specs: { Width: "210 cm", Depth: "90 cm", Height: "78 cm", Fabric: "Structured Linen", Frame: "Solid Ash" },
        image: "/assets/img/living-room/living-room-12.jpg"
      },
      {
        name: "MODERN ACCENT CREDENZA",
        specs: { Width: "160 cm", Depth: "45 cm", Height: "65 cm", Doors: "Push-to-open", Finish: "Smoked Oak" },
        image: "/assets/img/living-room/living-room-14.jpg"
      }
    ],
    price: 150000
  }
];

const PackageContext = createContext();

export function PackageProvider({ children }) {
  const [packages, setPackages] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Instant Cache from LocalStorage or Cookies
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kal_packages");
      if (stored) {
        try {
          setPackages(JSON.parse(stored));
        } catch (e) {
          setPackages(initialPackages);
        }
      } else {
        setPackages(initialPackages);
      }
    }

    // 2. Fetch from Database
    async function fetchPackages() {
      const supabase = getSupabase();
      if (!supabase) {
        setIsLoaded(true);
        return;
      }
      
      try {
        let { data, error } = await supabase.from('packages').select('*').order('id', { ascending: false });
        if (error) {
          console.warn("[PackageContext] Ordering by id failed, retrying without order:", error.message);
          const fallback = await supabase.from('packages').select('*');
          data = fallback.data;
          error = fallback.error;
        }

        if (error) {
          console.warn("[PackageContext] Error fetching packages from Supabase:", error.message);
        } else if (data && data.length > 0) {
          const normalized = data.map(pkg => ({
            ...pkg,
            mainImage: resolveImageUrl(pkg.mainImage),
            items: Array.isArray(pkg.items) ? pkg.items.map(item => ({
              ...item,
              image: resolveImageUrl(item.image)
            })) : []
          }));
          setPackages(normalized);
          if (typeof window !== "undefined") {
            localStorage.setItem("kal_packages", JSON.stringify(normalized));
          }
          setCookie("kal_packages_sync", { count: normalized.length, timestamp: Date.now() }, 30);
        }
      } catch (error) {
        console.error("[PackageContext] Error fetching packages:", error.message);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchPackages();

    // 3. Realtime Cross-tab Broadcast Listener
    const unsubscribeBroadcast = subscribeToBroadcast((event) => {
      if (!event || !event.type) return;

      if (event.type === "PACKAGES_UPDATED" && Array.isArray(event.payload)) {
        console.log("[PackageContext Realtime] Received live packages list update");
        setPackages(event.payload);
        if (typeof window !== "undefined") {
          localStorage.setItem("kal_packages", JSON.stringify(event.payload));
        }
      } else if (event.type === "PACKAGE_MUTATED" && event.payload) {
        const { eventType, new: newRow, old: oldRow } = event.payload;
        console.log("[PackageContext Realtime] Database mutation:", eventType);
        
        if (eventType === "INSERT" && newRow) {
          setPackages((prev) => {
            if (prev.some(p => p.id === newRow.id)) return prev;
            return [newRow, ...prev];
          });
        } else if (eventType === "UPDATE" && newRow) {
          setPackages((prev) => prev.map(p => p.id === newRow.id ? { ...p, ...newRow } : p));
        } else if (eventType === "DELETE" && oldRow) {
          setPackages((prev) => prev.filter(p => p.id !== oldRow.id));
        }
      }
    });

    // 4. Supabase Database-level Realtime Postgres Changes
    const unsubscribeSupabase = initSupabaseRealtime({
      onPackageChange: (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        if (eventType === "INSERT" && newRow) {
          setPackages((prev) => {
            if (prev.some(p => p.id === newRow.id)) return prev;
            return [newRow, ...prev];
          });
        } else if (eventType === "UPDATE" && newRow) {
          setPackages((prev) => prev.map(p => p.id === newRow.id ? { ...p, ...newRow } : p));
        } else if (eventType === "DELETE" && oldRow) {
          setPackages((prev) => prev.filter(p => p.id !== oldRow.id));
        }
      },
    });

    return () => {
      unsubscribeBroadcast();
      unsubscribeSupabase();
    };
  }, []);

  const addPackage = async (newPackage) => {
    const supabase = getSupabase();
    const tempId = newPackage.id || `pkg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const packageWithId = { ...newPackage, id: tempId };
    
    // 1. Instant Optimistic State Update
    let updatedList;
    setPackages((prev) => {
      updatedList = [packageWithId, ...prev];
      return updatedList;
    });

    // 2. Instant Cookie & LocalStorage Sync
    setCookie("kal_packages_sync", { count: updatedList?.length || 0, timestamp: Date.now() }, 30);
    if (typeof window !== "undefined") {
      localStorage.setItem("kal_packages", JSON.stringify(updatedList || []));
    }

    // 3. Realtime Cross-tab Broadcast
    broadcastChange("PACKAGES_UPDATED", updatedList);

    // 4. Asynchronous Database Write
    (async () => {
      let success = false;
      try {
        const result = await serverAddPackage(packageWithId);
        if (result && result.success) {
          success = true;
          if (result.data?.id) {
            setPackages(prev => prev.map(p => p.id === tempId ? { ...p, id: result.data.id } : p));
          }
        }
      } catch (e) {
        console.warn("[PackageContext] Server action add package failed, trying direct:", e.message);
      }

      if (!success && supabase) {
        try {
          const { error } = await supabase.from('packages').insert([packageWithId]);
          if (error) throw error;
        } catch (err) {
          console.error("[PackageContext] Direct insert package failed:", err.message);
          toast.error(err.message || "Failed to sync package with database");
        }
      }
    })();

    toast.success("Package added successfully");
  };

  const updatePackage = async (id, updatedData) => {
    const supabase = getSupabase();
    
    // 1. Instant Optimistic State Update
    let updatedList;
    setPackages((prev) => {
      updatedList = prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p));
      return updatedList;
    });

    // 2. Instant Cookie & LocalStorage Sync
    setCookie("kal_packages_sync", { count: updatedList?.length || 0, timestamp: Date.now() }, 30);
    if (typeof window !== "undefined") {
      localStorage.setItem("kal_packages", JSON.stringify(updatedList || []));
    }

    // 3. Realtime Cross-tab Broadcast
    broadcastChange("PACKAGES_UPDATED", updatedList);

    // 4. Asynchronous Database Write
    (async () => {
      let success = false;
      try {
        const result = await serverUpdatePackage(id, updatedData);
        if (result && result.success) {
          success = true;
        }
      } catch (e) {
        console.warn("[PackageContext] Server action update package failed, trying direct:", e.message);
      }

      if (!success && supabase) {
        try {
          const { error } = await supabase.from('packages').update(updatedData).eq('id', id);
          if (error) throw error;
        } catch (err) {
          console.error("[PackageContext] Direct update package failed:", err.message);
          toast.error(err.message || "Failed to sync package update with database");
        }
      }
    })();

    toast.success("Package updated successfully");
  };

  const deletePackage = async (id) => {
    const supabase = getSupabase();

    // 1. Instant Optimistic State Update
    let updatedList;
    setPackages((prev) => {
      updatedList = prev.filter((p) => p.id !== id);
      return updatedList;
    });

    // 2. Instant Cookie & LocalStorage Sync
    setCookie("kal_packages_sync", { count: updatedList?.length || 0, timestamp: Date.now() }, 30);
    if (typeof window !== "undefined") {
      localStorage.setItem("kal_packages", JSON.stringify(updatedList || []));
    }

    // 3. Realtime Cross-tab Broadcast
    broadcastChange("PACKAGES_UPDATED", updatedList);

    // 4. Asynchronous Database Write
    (async () => {
      let success = false;
      try {
        const result = await serverDeletePackage(id);
        if (result && result.success) {
          success = true;
        }
      } catch (e) {
        console.warn("[PackageContext] Server action delete package failed, trying direct:", e.message);
      }

      if (!success && supabase) {
        try {
          const { error } = await supabase.from('packages').delete().eq('id', id);
          if (error) throw error;
        } catch (err) {
          console.error("[PackageContext] Direct delete package failed:", err.message);
          toast.error(err.message || "Failed to delete package from database");
        }
      }
    })();

    toast.success("Package deleted successfully");
  };

  return (
    <PackageContext.Provider value={{ packages, addPackage, updatePackage, deletePackage, isLoaded }}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackages() {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error("usePackages must be used within a PackageProvider");
  }
  return context;
}