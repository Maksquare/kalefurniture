"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { serverGetCategories, serverSaveCategories } from "@/app/actions/admin";
import { getCookieJson, setCookie } from "@/lib/cookies";
import { broadcastChange, subscribeToBroadcast } from "@/lib/realtimeSync";
import { generateCategoryPrefix, CATEGORY_DEFAULT_PREFIXES } from "@/lib/catalogIntelligence";
import toast from "react-hot-toast";

export const DEFAULT_CATEGORIES = [
  {
    id: "Living Room",
    label: "Living Room",
    slug: "living-room",
    prefix: "KSF",
    icon: "🛋️",
    description: "Bespoke sectionals, lounge suites, and architectural accent pieces",
    isDefault: true,
  },
  {
    id: "Bedroom",
    label: "Bedroom",
    slug: "bedroom",
    prefix: "KBD",
    icon: "🛏️",
    description: "Sanctuary beds, velvet headboards, nightstands, and dressers",
    isDefault: true,
  },
  {
    id: "Dining Room",
    label: "Dining Room",
    slug: "dining-room",
    prefix: "KDN",
    icon: "🍽️",
    description: "Solid wood dining tables, sculptural chairs, and credenzas",
    isDefault: true,
  },
  {
    id: "Kitchen Cabinet",
    label: "Kitchen Cabinet",
    slug: "kitchen-cabinet",
    prefix: "KKC",
    icon: "🍳",
    description: "Custom European-standard kitchen cabinetry, pantries, and islands",
    isDefault: true,
  },
  {
    id: "Home Office",
    label: "Home Office",
    slug: "home-office",
    prefix: "KHO",
    icon: "💼",
    description: "Executive desks, leather task seating, and tailored shelving",
    isDefault: true,
  },
];

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Instant Cache Hydration (Zero layout shift / instant render)
  useEffect(() => {
    if (typeof window !== "undefined") {
      let cached = null;
      try {
        const stored = localStorage.getItem("kal_catalog_categories");
        if (stored) {
          cached = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("[CategoryContext] LocalStorage read failed:", e);
      }

      if (!cached) {
        const cookieVal = getCookieJson("kal_categories");
        if (cookieVal && Array.isArray(cookieVal)) {
          cached = cookieVal;
        }
      }

      if (cached && Array.isArray(cached) && cached.length > 0) {
        // Merge with defaults to ensure core categories exist
        const merged = mergeWithDefaults(cached);
        setCategories(merged);
      }
    }

    // 2. Fetch latest categories from Database
    async function loadCategories() {
      try {
        const res = await serverGetCategories();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const merged = mergeWithDefaults(res.data);
          setCategories(merged);
          if (typeof window !== "undefined") {
            localStorage.setItem("kal_catalog_categories", JSON.stringify(merged));
          }
          setCookie("kal_categories", merged, 30);
        }
      } catch (err) {
        console.warn("[CategoryContext] Load categories error:", err);
      } finally {
        setIsLoaded(true);
      }
    }

    loadCategories();

    // 3. Cross-tab Realtime Listener
    const unsubscribe = subscribeToBroadcast((event) => {
      if (event && event.type === "CATEGORIES_UPDATED" && Array.isArray(event.payload)) {
        const merged = mergeWithDefaults(event.payload);
        setCategories(merged);
        if (typeof window !== "undefined") {
          localStorage.setItem("kal_catalog_categories", JSON.stringify(merged));
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Helper to ensure all default categories are preserved with any custom additions
  function mergeWithDefaults(customList = []) {
    const list = [...customList];
    DEFAULT_CATEGORIES.forEach((def) => {
      const exists = list.some(
        (c) =>
          c.id?.toLowerCase() === def.id.toLowerCase() ||
          c.label?.toLowerCase() === def.label.toLowerCase() ||
          c.slug?.toLowerCase() === def.slug.toLowerCase()
      );
      if (!exists) {
        list.push(def);
      }
    });
    return list;
  }

  // Save changes to state, localStorage, cookies, server, and realtime broadcast
  const persistCategories = useCallback(async (newCategoriesList) => {
    setCategories(newCategoriesList);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("kal_catalog_categories", JSON.stringify(newCategoriesList));
      } catch (e) {}
    }
    setCookie("kal_categories", newCategoriesList, 30);

    // Realtime broadcast to other open tabs
    broadcastChange({
      type: "CATEGORIES_UPDATED",
      payload: newCategoriesList,
    });

    // Server Action persistence
    try {
      await serverSaveCategories(newCategoriesList);
    } catch (err) {
      console.error("[CategoryContext] Server save error:", err);
    }
  }, []);

  // Add Category
  const addCategory = useCallback(
    async ({ name, prefix, icon, description }) => {
      if (!name || !name.trim()) {
        toast.error("Category name is required");
        return { success: false, error: "Category name is required" };
      }

      const cleanName = name.trim();
      const existing = categories.find(
        (c) => c.label.toLowerCase() === cleanName.toLowerCase() || c.id.toLowerCase() === cleanName.toLowerCase()
      );

      if (existing) {
        toast.error(`Category "${cleanName}" already exists!`);
        return { success: false, error: "Category already exists" };
      }

      // Format code prefix (auto-generate if user left blank)
      const cleanPrefix = (
        prefix && prefix.trim()
          ? prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
          : generateCategoryPrefix(cleanName)
      ).slice(0, 4);

      const slug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const newCategory = {
        id: cleanName,
        label: cleanName,
        slug,
        prefix: cleanPrefix,
        icon: icon && icon.trim() ? icon.trim() : "🏷️",
        description: description ? description.trim() : "",
        isDefault: false,
        createdAt: new Date().toISOString(),
      };

      const updated = [...categories, newCategory];
      await persistCategories(updated);
      toast.success(`Category "${cleanName}" (${cleanPrefix}) created successfully!`);
      return { success: true, category: newCategory };
    },
    [categories, persistCategories]
  );

  // Update Category
  const updateCategory = useCallback(
    async (id, updates) => {
      const idx = categories.findIndex((c) => c.id === id || c.label === id || c.slug === id);
      if (idx === -1) {
        toast.error("Category not found");
        return { success: false, error: "Category not found" };
      }

      const existing = categories[idx];
      const cleanName = updates.name ? updates.name.trim() : existing.label;
      const cleanPrefix = updates.prefix
        ? updates.prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)
        : existing.prefix;

      const updatedCategory = {
        ...existing,
        label: cleanName,
        id: existing.isDefault ? existing.id : cleanName,
        prefix: cleanPrefix,
        icon: updates.icon !== undefined ? updates.icon : existing.icon,
        description: updates.description !== undefined ? updates.description : existing.description,
        updatedAt: new Date().toISOString(),
      };

      const updated = [...categories];
      updated[idx] = updatedCategory;
      await persistCategories(updated);
      toast.success(`Category "${cleanName}" updated successfully!`);
      return { success: true, category: updatedCategory };
    },
    [categories, persistCategories]
  );

  // Delete Category
  const deleteCategory = useCallback(
    async (id) => {
      const target = categories.find((c) => c.id === id || c.label === id || c.slug === id);
      if (!target) {
        toast.error("Category not found");
        return { success: false };
      }

      if (target.isDefault) {
        toast.error(`"${target.label}" is a core showroom category and cannot be removed.`);
        return { success: false, error: "Cannot delete core category" };
      }

      const updated = categories.filter((c) => c.id !== target.id && c.label !== target.label);
      await persistCategories(updated);
      toast.success(`Category "${target.label}" removed.`);
      return { success: true };
    },
    [categories, persistCategories]
  );

  // Fast prefix lookup map
  const prefixMap = useMemo(() => {
    const map = { ...CATEGORY_DEFAULT_PREFIXES };
    categories.forEach((cat) => {
      if (cat.prefix) {
        map[cat.id] = cat.prefix;
        map[cat.label] = cat.prefix;
        map[cat.slug] = cat.prefix;
      }
    });
    return map;
  }, [categories]);

  // Lookup prefix for a given category name or id
  const getCategoryPrefix = useCallback(
    (nameOrId) => {
      if (!nameOrId) return "KSF";
      if (prefixMap[nameOrId]) return prefixMap[nameOrId];
      const found = categories.find(
        (c) =>
          c.id?.toLowerCase() === nameOrId.toLowerCase() ||
          c.label?.toLowerCase() === nameOrId.toLowerCase() ||
          c.slug?.toLowerCase() === nameOrId.toLowerCase()
      );
      if (found && found.prefix) return found.prefix;
      return generateCategoryPrefix(nameOrId);
    },
    [categories, prefixMap]
  );

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isLoaded,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryPrefix,
        prefixMap,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    // Graceful fallback if invoked outside of provider
    return {
      categories: DEFAULT_CATEGORIES,
      isLoaded: true,
      addCategory: async () => ({ success: false }),
      updateCategory: async () => ({ success: false }),
      deleteCategory: async () => ({ success: false }),
      getCategoryPrefix: (name) => generateCategoryPrefix(name),
      prefixMap: CATEGORY_DEFAULT_PREFIXES,
    };
  }
  return context;
}
