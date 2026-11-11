"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { serverSaveSiteSetting, serverGetSiteSettings } from "@/app/actions/admin";
import { getCookieJson, setCookie } from "@/lib/cookies";
import { broadcastChange, subscribeToBroadcast, initSupabaseRealtime } from "@/lib/realtimeSync";

export const defaultPromoSettings = {
  enabled: true,
  title: "Complete your home with Curated Packages",
  subtitle: "Discover our premium furniture bundles at exclusive promotional prices. Elevate your entire living space instantly.",
  buttonText: "Explore Packages",
  buttonLink: "/packages",
  image: "/assets/img/hero/beige-chair.jpeg",
  bgColor: "#DFD2C1",
};

export const defaultFeaturedCards = [
  {
    id: "feat-1",
    name: "Modern Chair",
    title: "MODERN CHAIR",
    price: 249000,
    badge: "NEW",
    image: "/assets/img/hero/beige-chair.jpeg",
    description: "Sculptural ochre accent chair engineered with organic contours, steel stiletto support, and stain-resistant textured weave.",
    category: "Living Room",
    dimensions: "W:78cm × D:82cm × H:86cm",
    finish: "Ochre Textured Bouclé",
    structure: "Kiln-Dried Solid Beechwood & Brass Legs",
    warranty: "10-Year Master Structural Guarantee",
  },
  {
    id: "feat-2",
    name: "Emerald Armchair",
    title: "EMERALD ARMCHAIR",
    price: 189000,
    badge: "",
    image: "/assets/img/hero/green-chair.jpeg",
    description: "Luxe emerald green velvet lounge armchair with rich walnut side accents and tapered mid-century legs.",
    category: "Living Room",
    dimensions: "W:85cm × D:90cm × H:82cm",
    finish: "Emerald Green Silk Velvet",
    structure: "Solid American Walnut & High-Resilience Foam",
    warranty: "10-Year Master Structural Guarantee",
  },
  {
    id: "feat-3",
    name: "Bouclé Sofa",
    title: "BOUCLÉ SOFA",
    price: 295000,
    badge: "",
    image: "/assets/img/living-room/living-room-1.jpg",
    description: "Contemporary two-seater tailored lounge sofa in warm cream bouclé upholstery with solid walnut plinth base.",
    category: "Living Room",
    dimensions: "W:180cm × D:92cm × H:80cm",
    finish: "Warm Cream Bouclé & Solid Walnut",
    structure: "Kiln-Dried Solid Hardwood Frame",
    warranty: "10-Year Master Structural Guarantee",
  },
];

export const defaultHeroSettings = {
  mode: "custom", // "custom" | "product"
  imageUrl: "/assets/img/hero/sunlit-luxury-living-room.png",
  imageFit: "cover", // "contain" (cutout/blend) | "cover" (editorial card)
  badge: "INTERIOR DESIGN",
  title: "DESIGN",
  accentWord: "FURNITURE",
  subtitle: "Discover premium furniture pieces that elevate your living space with timeless style and unmatched comfort.",
  showOfferTag: false,
  offerPrice: "",
  primaryButtonText: "EXPLORE COLLECTION",
  primaryButtonLink: "/collections",
  secondaryButtonText: "View Case Study",
  secondaryButtonLink: "/about",
  productId: null,
  featuredCards: defaultFeaturedCards,
};

const SiteSettingsContext = createContext();

export function SiteSettingsProvider({ children }) {
  const [promoSettings, setPromoSettings] = useState(null);
  const [heroSettings, setHeroSettings] = useState(null);
  const [heroProductId, setHeroProductId] = useState(null);
  const [heroProductData, setHeroProductData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 2. Fetch from Database asynchronously
    async function loadSettings() {
      try {
        const res = await serverGetSiteSettings();
        if (res.success && res.data) {
          if (res.data.promo_banner) {
            setPromoSettings(res.data.promo_banner);
            setCookie("kal_promo_settings", res.data.promo_banner, 30);
          }
          if (res.data.hero_settings) {
            setHeroSettings(res.data.hero_settings);
            setCookie("kal_hero_settings", res.data.hero_settings, 30);
          }
          if (res.data.hero_product_id) setHeroProductId(res.data.hero_product_id);
          if (res.data.hero_product_data) setHeroProductData(res.data.hero_product_data);
        } else {
          const client = getSupabase();
          if (client) {
            const { data } = await client.from("site_settings").select("*");
            if (data) {
              const promoRow = data.find((r) => r.key === "promo_banner");
              const heroSettingsRow = data.find((r) => r.key === "hero_settings");
              const heroRow = data.find((r) => r.key === "hero_product_id");
              const heroDataRow = data.find((r) => r.key === "hero_product_data");
              if (promoRow?.value) {
                setPromoSettings(promoRow.value);
                setCookie("kal_promo_settings", promoRow.value, 30);
              }
              if (heroSettingsRow?.value) {
                setHeroSettings(heroSettingsRow.value);
                setCookie("kal_hero_settings", heroSettingsRow.value, 30);
              }
              if (heroRow?.value) setHeroProductId(heroRow.value);
              if (heroDataRow?.value) setHeroProductData(heroDataRow.value);
            }
          }
        }
      } catch (e) {
        console.warn("[SiteSettingsContext] Load error (using fallback):", e.message);
      } finally {
        setIsLoaded(true);
      }
    }
    loadSettings();

    // 3. Subscribe to Realtime Cross-tab Broadcasts
    const unsubscribeBroadcast = subscribeToBroadcast((event) => {
      if (!event || !event.type) return;

      if (event.type === "HERO_SETTINGS_UPDATED" && event.payload) {
        console.log("[SiteSettingsContext Realtime] Received live hero update:", event.payload);
        setHeroSettings(event.payload);
        setCookie("kal_hero_settings", event.payload, 30);
      } else if (event.type === "PROMO_SETTINGS_UPDATED" && event.payload) {
        console.log("[SiteSettingsContext Realtime] Received live promo update:", event.payload);
        setPromoSettings(event.payload);
        setCookie("kal_promo_settings", event.payload, 30);
      } else if (event.type === "HERO_PRODUCT_UPDATED") {
        setHeroProductId(event.payload?.id || null);
        setHeroProductData(event.payload || null);
      }
    });

    // 4. Subscribe to Supabase Database Realtime Postgres Changes
    const unsubscribeSupabase = initSupabaseRealtime({
      onSettingsChange: (payload) => {
        const row = payload.new;
        if (!row || !row.key) return;

        console.log("[SiteSettingsContext Supabase Realtime] Change received:", row.key);
        if (row.key === "hero_settings" && row.value) {
          setHeroSettings(row.value);
          setCookie("kal_hero_settings", row.value, 30);
        } else if (row.key === "promo_banner" && row.value) {
          setPromoSettings(row.value);
          setCookie("kal_promo_settings", row.value, 30);
        } else if (row.key === "hero_product_id") {
          setHeroProductId(row.value);
        } else if (row.key === "hero_product_data") {
          setHeroProductData(row.value);
        }
      },
    });

    return () => {
      unsubscribeBroadcast();
      unsubscribeSupabase();
    };
  }, []);

  // Instant optimistic update with async DB sync & cross-tab broadcast
  const updatePromoSettings = async (newSettings) => {
    const updated = { ...promoSettings, ...newSettings };

    // 1. Instant local update
    setPromoSettings(updated);

    // 2. Instant Cookie & LocalStorage sync
    setCookie("kal_promo_settings", updated, 30);
    setCookie("kal_site_sync", { type: "PROMO_UPDATED", timestamp: Date.now() }, 30);
    if (typeof window !== "undefined") {
      localStorage.setItem("kal_promo_settings", JSON.stringify(updated));
    }

    // 3. Realtime Cross-tab broadcast
    broadcastChange("PROMO_SETTINGS_UPDATED", updated);

    // 4. Asynchronous Database write
    (async () => {
      let success = false;
      try {
        const result = await serverSaveSiteSetting("promo_banner", updated);
        if (result && result.success) success = true;
      } catch (e) {
        console.warn("[SiteSettingsContext] Server action save failed, trying direct:", e.message);
      }

      if (!success) {
        try {
          const client = getSupabase();
          if (client) {
            await client.from("site_settings").upsert(
              { key: "promo_banner", value: updated, updated_at: new Date().toISOString() },
              { onConflict: "key" }
            );
          }
        } catch (err) {
          console.error("[SiteSettingsContext] Direct promo setting save error:", err.message);
        }
      }
    })();
  };

  // Instant optimistic hero product update
  const updateHeroProduct = async (product) => {
    if (!product) {
      setHeroProductId(null);
      setHeroProductData(null);
      setCookie("kal_hero_product_id", "", -1);
      if (typeof window !== "undefined") {
        localStorage.removeItem("kal_hero_product_id");
        localStorage.removeItem("kal_hero_product_data");
      }
      broadcastChange("HERO_PRODUCT_UPDATED", null);

      (async () => {
        try {
          await serverSaveSiteSetting("hero_product_id", null);
          await serverSaveSiteSetting("hero_product_data", null);
        } catch (e) {}
      })();
      return;
    }

    const id = product.id;
    setHeroProductId(id);
    setHeroProductData(product);

    setCookie("kal_hero_product_id", id, 30);
    if (typeof window !== "undefined") {
      localStorage.setItem("kal_hero_product_id", id);
      localStorage.setItem("kal_hero_product_data", JSON.stringify(product));
    }
    broadcastChange("HERO_PRODUCT_UPDATED", product);

    (async () => {
      let success = false;
      try {
        const idResult = await serverSaveSiteSetting("hero_product_id", id);
        const dataResult = await serverSaveSiteSetting("hero_product_data", product);
        if (idResult?.success && dataResult?.success) success = true;
      } catch (e) {}

      if (!success) {
        try {
          const client = getSupabase();
          if (client) {
            await client.from("site_settings").upsert([
              { key: "hero_product_id", value: id, updated_at: new Date().toISOString() },
              { key: "hero_product_data", value: product, updated_at: new Date().toISOString() }
            ], { onConflict: "key" });
          }
        } catch (e) {}
      }
    })();
  };

  // Instant optimistic hero settings update
  const updateHeroSettings = async (newSettings) => {
    const updated = { ...heroSettings, ...newSettings };

    // 1. Instant local update
    setHeroSettings(updated);

    // 2. Instant Cookie & LocalStorage sync
    setCookie("kal_hero_settings", updated, 30);
    setCookie("kal_site_sync", { type: "HERO_UPDATED", timestamp: Date.now() }, 30);
    if (typeof window !== "undefined") {
      localStorage.setItem("kal_hero_settings", JSON.stringify(updated));
    }

    // 3. Realtime Cross-tab broadcast (reflects live on open storefront tabs!)
    broadcastChange("HERO_SETTINGS_UPDATED", updated);

    // 4. Asynchronous Database write in background
    (async () => {
      let success = false;
      try {
        const result = await serverSaveSiteSetting("hero_settings", updated);
        if (result && result.success) success = true;
      } catch (e) {
        console.warn("[SiteSettingsContext] Server save hero settings failed, trying direct:", e.message);
      }

      if (!success) {
        try {
          const client = getSupabase();
          if (client) {
            await client.from("site_settings").upsert(
              { key: "hero_settings", value: updated, updated_at: new Date().toISOString() },
              { onConflict: "key" }
            );
          }
        } catch (err) {
          console.error("[SiteSettingsContext] Direct hero setting save error:", err.message);
        }
      }
    })();
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        promoSettings,
        updatePromoSettings,
        heroSettings,
        updateHeroSettings,
        heroProductId,
        heroProductData,
        updateHeroProduct,
        updateHeroProductId: updateHeroProduct,
        isLoaded,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    return {
      promoSettings: defaultPromoSettings,
      updatePromoSettings: () => {},
      heroSettings: defaultHeroSettings,
      updateHeroSettings: () => {},
      heroProductId: null,
      heroProductData: null,
      updateHeroProduct: () => {},
      updateHeroProductId: () => {},
      isLoaded: true,
    };
  }
  return ctx;
};
