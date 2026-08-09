"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const storedCart = localStorage.getItem("luxe-cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to load cart", error);
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("luxe-cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  const addToCart = (product, selectedColor = null) => {
    setCartItems((prev) => {
      const colorTag = selectedColor ? (typeof selectedColor === "string" ? selectedColor : selectedColor.label || selectedColor.name) : null;
      const itemKey = colorTag ? `${product.id}-${colorTag}` : product.id;
      const existingItem = prev.find((item) => (item.cartKey || item.id) === itemKey);
      
      if (existingItem) {
        return prev.map((item) =>
          (item.cartKey || item.id) === itemKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, cartKey: itemKey, selectedColor: colorTag, quantity: 1 }];
    });
  };

  const removeFromCart = (cartKeyOrId) => {
    setCartItems((prev) => prev.filter((item) => (item.cartKey || item.id) !== cartKeyOrId));
  };

  const updateQuantity = (cartKeyOrId, amount) => {
    setCartItems((prev) => {
      return prev.map((item) => {
        if ((item.cartKey || item.id) === cartKeyOrId) {
          const newQuantity = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => setCartItems([]);

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
