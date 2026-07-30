"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { allProducts as initialProducts } from "@/lib/data";
import { serverAddProduct, serverUpdateProduct, serverDeleteProduct } from "@/app/actions/admin";
import toast from "react-hot-toast";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      if (!supabase) {
        // Fallback to local data if Supabase is not configured yet
        const stored = localStorage.getItem("kal_products");
        if (stored) {
          setProducts(JSON.parse(stored));
        } else {
          setProducts(initialProducts);
        }
        setIsLoaded(true);
        return;
      }
      
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        
        // Sort or process if needed, assuming Supabase returns the rows directly
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error.message);
        // Fallback to initial data if DB fails
        setProducts(initialProducts); 
      } finally {
        setIsLoaded(true);
      }
    }
    fetchProducts();
  }, []);

  const addProduct = async (newProduct) => {
    // Generate a temporary ID if one isn't provided
    const tempId = newProduct.id || `temp-${Date.now()}`;
    const productWithId = { ...newProduct, id: tempId };
    
    // If this product is featured, turn off featured for all other products in the same category
    if (productWithId.featured) {
      setProducts((prev) => prev.map(p => 
        p.category === productWithId.category ? { ...p, featured: false } : p
      ));
      
      if (supabase) {
        // Optimistic state was updated above. The server action handles the DB side.
      }
    }

    // Optimistic update
    setProducts((prev) => [productWithId, ...prev]);

    if (!supabase) {
      // Local storage fallback
      const updatedList = [productWithId, ...products].map(p => 
        (productWithId.featured && p.category === productWithId.category && p.id !== tempId) ? { ...p, featured: false } : p
      );
      localStorage.setItem("kal_products", JSON.stringify(updatedList));
      return;
    }

    try {
      const result = await serverAddProduct(productWithId);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Product added successfully");
    } catch (error) {
      console.error("Error adding product via server action:", error.message);
      toast.error(error.message || "Failed to add product");
      // Revert optimistic update on error by reloading from DB
      const { data } = await supabase.from('products').select('*');
      if (data) setProducts(data);
    }
  };

  const updateProduct = async (id, updatedData) => {
    // If we are setting THIS product to featured
    if (updatedData.featured === true) {
      const category = updatedData.category || products.find(p => p.id === id)?.category;
      
      // Turn off featured for all other products in the same category
      setProducts((prev) => prev.map(p => 
        (p.category === category && p.id !== id) ? { ...p, featured: false } : p
      ));
    }

    // Optimistic update for the targeted product
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p)));

    if (!supabase) {
      // Local storage fallback
      let currentProducts = products;
      if (updatedData.featured === true) {
        const category = updatedData.category || products.find(p => p.id === id)?.category;
        currentProducts = products.map(p => 
          (p.category === category && p.id !== id) ? { ...p, featured: false } : p
        );
      }
      const updated = currentProducts.map((p) => (p.id === id ? { ...p, ...updatedData } : p));
      localStorage.setItem("kal_products", JSON.stringify(updated));
      return;
    }

    try {
      const result = await serverUpdateProduct(id, updatedData);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Product updated successfully");
    } catch (error) {
      console.error("Error updating product via server action:", error.message);
      toast.error(error.message || "Failed to update product");
      // Reload from DB to fix state if update failed
      const { data } = await supabase.from('products').select('*');
      if (data) setProducts(data);
    }
  };

  const deleteProduct = async (id) => {
    // Optimistic update
    const previousProducts = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== id));

    if (!supabase) {
      // Local storage fallback
      const updated = products.filter((p) => p.id !== id);
      localStorage.setItem("kal_products", JSON.stringify(updated));
      return;
    }

    try {
      const result = await serverDeleteProduct(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product via server action:", error.message);
      toast.error(error.message || "Failed to delete product");
      // Revert on error
      setProducts(previousProducts);
    }
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
