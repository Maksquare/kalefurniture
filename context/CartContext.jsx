"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getCookieJson, setCookie } from "@/lib/cookies";
import { broadcastChange, subscribeToBroadcast } from "@/lib/realtimeSync";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from cookies or localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const cookieCart = getCookieJson("kal_cart");
      if (Array.isArray(cookieCart) && cookieCart.length > 0) {
        setCartItems(cookieCart);
      } else {
        const storedCart = localStorage.getItem("luxe-cart");
        if (storedCart) {
          const parsed = JSON.parse(storedCart);
          setCartItems(parsed);
          setCookie("kal_cart", parsed, 30);
        }
      }
    } catch (error) {
      console.error("[CartContext] Failed to load cart:", error);
    }

    // Subscribe to cross-tab cart updates
    const unsubscribe = subscribeToBroadcast((event) => {
      if (event && event.type === "CART_UPDATED" && Array.isArray(event.payload)) {
        setCartItems(event.payload);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync cart to cookies and localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem("luxe-cart", JSON.stringify(cartItems));
        setCookie("kal_cart", cartItems, 30);
      } catch (e) {}
    }
  }, [cartItems, isMounted]);

  const addToCart = (product, selectedColor = null) => {
    setCartItems((prev) => {
      const colorTag = selectedColor ? (typeof selectedColor === "string" ? selectedColor : selectedColor.label || selectedColor.name) : null;
      const itemKey = colorTag ? `${product.id}-${colorTag}` : product.id;
      const existingItem = prev.find((item) => (item.cartKey || item.id) === itemKey);
      
      let nextCart;
      if (existingItem) {
        nextCart = prev.map((item) =>
          (item.cartKey || item.id) === itemKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        nextCart = [...prev, { ...product, cartKey: itemKey, selectedColor: colorTag, quantity: 1 }];
      }

      broadcastChange("CART_UPDATED", nextCart);
      return nextCart;
    });
  };

  const removeFromCart = (cartKeyOrId) => {
    setCartItems((prev) => {
      const nextCart = prev.filter((item) => (item.cartKey || item.id) !== cartKeyOrId);
      broadcastChange("CART_UPDATED", nextCart);
      return nextCart;
    });
  };

  const updateQuantity = (cartKeyOrId, amount) => {
    setCartItems((prev) => {
      const nextCart = prev.map((item) => {
        if ((item.cartKey || item.id) === cartKeyOrId) {
          const newQuantity = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      broadcastChange("CART_UPDATED", nextCart);
      return nextCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    broadcastChange("CART_UPDATED", []);
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
