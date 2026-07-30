"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { useCart } from "../context/CartContext";

const CartToast = () => {
  const { cartCount, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {!isCartOpen && cartCount > 0 && (
        <motion.button
          key="floating-cart"
          onClick={() => setIsCartOpen(true)}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-28 right-6 z-[500] flex items-center gap-4 bg-gold text-primary border border-gold/30 rounded-full shadow-[0_10px_40px_rgba(201,168,76,0.35)] px-6 py-4 hover:scale-105 hover:bg-gold-light transition-all duration-300 group cursor-pointer"
        >
          <div className="relative">
            <PiShoppingCartSimpleBold size={24} />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-gold shadow-lg">
              {cartCount}
            </span>
          </div>

          <div className="flex flex-col items-start min-w-0">
            <span className="font-secondary text-[10px] font-bold tracking-widest uppercase opacity-80">
              View Cart
            </span>
            <span className="font-primary text-[16px] leading-tight font-medium">
              {cartTotal.toLocaleString()} ETB
            </span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default CartToast;
