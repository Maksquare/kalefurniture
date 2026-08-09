"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { serverSaveSiteSetting, serverGetSiteSettings } from "@/app/actions/admin";

const defaultPromoSettings = {
  enabled: true,
  title: "Complete your home with Curated Packages",
  subtitle: "Discover our premium furniture bundles at exclusive promotional prices. Elevate your entire living space instantly.",
  buttonText: "Explore Packages",
  buttonLink: "/packages",
  image: "/assets/img/hero/beige-chair.jpeg",
  bgColor: "#DFD2C1",
};

const SiteSettingsContext = createContext();

export function SiteSettingsProvider({ children }) {
  const [promoSettings, setPromoSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("kal_promo_settings");
      if (local) { try { return JSON.parse(local); } catch (e) {} }
    }
    return defaultPromoSettings;
  });

  const [heroProductId, setHeroProductId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("kal_hero_product_id") || null;
    }
    return null;
  });

  const [heroProductData, setHeroProductData] = useState(() => {
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem("kal_hero_product_data");
      if (localData) { try { return JSON.parse(localData); } catch (e) {} }
    }
    return null;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      // Fetch from Database via server action
      try {
        const res = await serverGetSiteSettings();
        if (res.success && res.data) {
          if (res.data.promo_banner) setPromoSettings(res.data.promo_banner);
          if (res.data.hero_product_id) setHeroProductId(res.data.hero_product_id);
          if (res.data.hero_product_data) setHeroProductData(res.data.hero_product_data);
        } else if (supabase) {
          const { data } = await supabase.from("site_settings").select("*");
          if (data) {
            const promoRow = data.find((r) => r.key === "promo_banner");
            const heroRow = data.find((r) => r.key === "hero_product_id");
            const heroDataRow = data.find((r) => r.key === "hero_product_data");
            if (promoRow?.value) setPromoSettings(promoRow.value);
            if (heroRow?.value) setHeroProductId(heroRow.value);
            if (heroDataRow?.value) setHeroProductData(heroDataRow.value);
          }
        }
      } catch (e) {
        console.warn("Database site_settings load error (using fallback):", e.message);
      }

      setIsLoaded(true);
    }
    loadSettings();
  }, []);

  const updatePromoSettings = async (newSettings) => {
    const updated = { ...promoSettings, ...newSettings };
    setPromoSettings(updated);
    localStorage.setItem("kal_promo_settings", JSON.stringify(updated));

    try {
      await serverSaveSiteSetting("promo_banner", updated);
    } catch (e) {
      console.error("Failed to save promo settings to DB:", e);
    }
  };

  const updateHeroProduct = async (product) => {
    if (!product) {
      setHeroProductId(null);
      setHeroProductData(null);
      localStorage.removeItem("kal_hero_product_id");
      localStorage.removeItem("kal_hero_product_data");
      try {
        await serverSaveSiteSetting("hero_product_id", null);
        await serverSaveSiteSetting("hero_product_data", null);
      } catch (e) {}
      return;
    }

    const id = product.id;
    setHeroProductId(id);
    setHeroProductData(product);
    localStorage.setItem("kal_hero_product_id", id);
    localStorage.setItem("kal_hero_product_data", JSON.stringify(product));

    try {
      await serverSaveSiteSetting("hero_product_id", id);
      await serverSaveSiteSetting("hero_product_data", product);
    } catch (e) {
      console.error("Failed to save hero product to DB:", e);
    }
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        promoSettings,
        updatePromoSettings,
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
      heroProductId: null,
      heroProductData: null,
      updateHeroProduct: () => {},
      updateHeroProductId: () => {},
      isLoaded: true,
    };
  }
  return ctx;
};
