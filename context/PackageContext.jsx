"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { serverAddPackage, serverUpdatePackage, serverDeletePackage } from "@/app/actions/admin";
import toast from "react-hot-toast";

const initialPackages = [
  {
    id: "pkg-1",
    name: "KAL SIGNATURE",
    collection: "COMPLETE HOME BUNDLE",
    description: "The ultimate curated collection. Transform your entire living space with our premium selection of matching, high-end pieces.",
    mainImage: "/assets/img/hero/beige-chair.jpeg",
    bgColor: "#FAF8F5", // Light beige
    accentColor: "#6B2B31", // Burgundy
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
    bgColor: "#F0F0F0", // Light grey
    accentColor: "#2A2A2A", // Dark charcoal
    items: [
      {
        name: "ESSENTIAL BED",
        specs: { Size: "King", Width: "180 cm", Length: "200 cm", Material: "Linen Blend", Frame: "Solid Ash" },
        image: "/assets/img/living-room/living-room-12.jpg"
      },
      {
        name: "NIGHTSTAND PAIR",
        specs: { Width: "50 cm", Depth: "40 cm", Height: "55 cm", Drawers: "Soft-close", Material: "Matte Lacquer" },
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
    async function fetchPackages() {
      if (!supabase) {
        // Fallback to local data if Supabase is not configured yet
        const stored = localStorage.getItem("kal_packages");
        if (stored) {
          setPackages(JSON.parse(stored));
        } else {
          setPackages(initialPackages);
        }
        setIsLoaded(true);
        return;
      }
      
      try {
        const { data, error } = await supabase.from('packages').select('*');
        if (error) throw error;
        setPackages(data || []);
      } catch (error) {
        console.error("Error fetching packages:", error.message);
        setPackages(initialPackages); 
      } finally {
        setIsLoaded(true);
      }
    }
    fetchPackages();
  }, []);

  const addPackage = async (newPackage) => {
    const tempId = newPackage.id || `pkg-${Date.now()}`;
    const packageWithId = { ...newPackage, id: tempId };
    
    // Optimistic update
    setPackages((prev) => [packageWithId, ...prev]);

    if (!supabase) {
      localStorage.setItem("kal_packages", JSON.stringify([packageWithId, ...packages]));
      return;
    }

    try {
      const result = await serverAddPackage(packageWithId);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Package added successfully");
    } catch (error) {
      console.error("Error adding package via server action:", error.message);
      toast.error(error.message || "Failed to add package");
      // Revert optimistic update
      setPackages((prev) => prev.filter(p => p.id !== tempId));
    }
  };

  const updatePackage = async (id, updatedData) => {
    // Optimistic update
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p)));

    if (!supabase) {
      const updated = packages.map((p) => (p.id === id ? { ...p, ...updatedData } : p));
      localStorage.setItem("kal_packages", JSON.stringify(updated));
      return;
    }

    try {
      const result = await serverUpdatePackage(id, updatedData);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Package updated successfully");
    } catch (error) {
      console.error("Error updating package via server action:", error.message);
      toast.error(error.message || "Failed to update package");
      // Reload to fix state
      const { data } = await supabase.from('packages').select('*');
      if (data) setPackages(data);
    }
  };

  const deletePackage = async (id) => {
    // Optimistic update
    const previous = [...packages];
    setPackages((prev) => prev.filter((p) => p.id !== id));

    if (!supabase) {
      const updated = packages.filter((p) => p.id !== id);
      localStorage.setItem("kal_packages", JSON.stringify(updated));
      return;
    }

    try {
      const result = await serverDeletePackage(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Package deleted successfully");
    } catch (error) {
      console.error("Error deleting package via server action:", error.message);
      toast.error(error.message || "Failed to delete package");
      // Revert on error
      setPackages(previous);
    }
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
