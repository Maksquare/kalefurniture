"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiXLight, PiTrashLight, PiMinusLight, PiPlusLight, PiWhatsappLogoLight } from "react-icons/pi";
import { useCart } from "../context/CartContext";
import { incrementSalesCount } from "@/app/actions/checkout";
import { resolveImageUrl } from "@/lib/imageUtils";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { x: "100%", transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const CartDrawer = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
  } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  const handleCheckout = async () => {
    const phoneNumber = "251936358805"; // Kal Furniture contact phone / WhatsApp
    
    const header = `🏛️ *KAL FURNITURE - CUSTOMER ORDER*\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    const itemsDetails = cartItems
      .map((item, idx) => {
        const lines = [
          `*${idx + 1}. ${item.name}*`,
          `  - *Quantity:* *${item.quantity}x*`,
          `  - *Price:* *${(item.price || 0).toLocaleString()} ብር*`,
          item.selectedColor ? `  - *Color / Finish Choice:* *${item.selectedColor}*` : null,
          item.category ? `  - *Category:* *${item.category}*` : null,
          item.dimensions ? `  - *Dimensions / Size:* *${item.dimensions.replace(/\n/g, ', ')}*` : null,
          item.structure ? `  - *Structure / Material:* *${item.structure.replace(/\n/g, ', ')}*` : null,
          item.finish ? `  - *Finish Specs:* *${item.finish.replace(/\n/g, ', ')}*` : null,
        ].filter(Boolean);

        return lines.join("\n");
      })
      .join("\n\n");

    const totalSection = `\n\n━━━━━━━━━━━━━━━━━━━━━━\n💰 *GRAND TOTAL:* *${(cartTotal || 0).toLocaleString()} ብር*\n━━━━━━━━━━━━━━━━━━━━━━`;
    
    const fullMessage = header + itemsDetails + totalSection;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(fullMessage)}`, "_blank");

    // Track sales in database silently
    incrementSalesCount(cartItems);

    // Smart Cart Feature: Auto-clear and close after sending order
    setTimeout(() => {
      clearCart();
      setIsCartOpen(false);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[500] bg-primary/20 backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        >
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 right-0 h-full w-full sm:w-[450px] bg-cream border-l border-primary/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary/10 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <h2 className="font-primary text-2xl font-semibold text-secondary">Your Selection</h2>
                {cartItems.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gold/15 text-primary font-secondary text-[11px] font-bold">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[10px] font-secondary uppercase tracking-[0.2em] text-red-500/80 hover:text-red-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-primary/5 hover:bg-gold hover:text-white transition-all duration-300 group active:scale-95"
                  aria-label="Close cart"
                >
                  <PiXLight className="text-lg text-secondary/70 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-5 border border-secondary/10">
                    <PiWhatsappLogoLight className="text-4xl text-gold" />
                  </div>
                  <h3 className="font-primary text-2xl font-semibold text-secondary mb-2">Your cart is empty</h3>
                  <p className="font-secondary text-[13px] text-secondary/60 max-w-[260px] mb-6 font-light leading-relaxed">
                    Discover handcrafted bespoke pieces and signature collections designed for your living space.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-3 rounded-full bg-primary text-white font-secondary text-[12px] tracking-wider uppercase font-medium hover:bg-gold hover:text-primary transition-all duration-300 shadow-sm active:scale-95"
                  >
                    Explore Collections
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {cartItems.map((item, idx) => {
                    const key = item.cartKey || item.id || `cart-item-${idx}`;
                    return (
                      <div key={key} className="flex gap-4 p-3.5 bg-white rounded-2xl border border-secondary/10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] group hover:border-gold/30 transition-all duration-300">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F6F3EC] shrink-0 relative border border-secondary/10 flex items-center justify-center">
                          <img 
                            src={resolveImageUrl(item.images ? item.images[0] : item.image)} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                        
                        {/* Info */}
                        <div className="flex flex-col flex-1 min-w-0 justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-0.5 gap-2">
                              <h4 className="font-primary text-[17px] font-semibold text-secondary leading-tight truncate">{item.name}</h4>
                              <button 
                                onClick={() => removeFromCart(key)}
                                className="text-secondary/40 hover:text-red-500 transition-colors p-1 -mr-1"
                                title="Remove item"
                              >
                                <PiTrashLight size={16} />
                              </button>
                            </div>

                            {/* Selected Color Badge */}
                            {item.selectedColor && (
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                                <span className="font-secondary text-[11px] text-secondary/70 capitalize">
                                  Finish: <strong className="text-secondary font-medium">{item.selectedColor}</strong>
                                </span>
                              </div>
                            )}

                            <p className="font-secondary text-[14px] text-primary font-bold">
                              {(item.price || 0).toLocaleString()} <span className="font-ethiopic text-[11px] font-normal text-secondary/65">ብር</span>
                            </p>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center bg-secondary/5 rounded-full border border-secondary/10 px-1 py-0.5">
                              <button 
                                onClick={() => updateQuantity(key, -1)}
                                className="w-6 h-6 flex items-center justify-center text-secondary/70 hover:text-secondary active:scale-90 transition-transform"
                                aria-label="Decrease quantity"
                              >
                                <PiMinusLight size={12} />
                              </button>
                              <span className="w-6 text-center font-secondary text-[13px] text-secondary font-semibold">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(key, 1)}
                                className="w-6 h-6 flex items-center justify-center text-secondary/70 hover:text-secondary active:scale-90 transition-transform"
                                aria-label="Increase quantity"
                              >
                                <PiPlusLight size={12} />
                              </button>
                            </div>
                            
                            <span className="font-secondary text-[12px] font-semibold text-secondary/60">
                              {((item.price || 0) * item.quantity).toLocaleString()} <span className="font-ethiopic text-[10px]">ብር</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-primary/10 bg-ivory/80 backdrop-blur-md">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="font-secondary text-[12px] font-bold text-secondary/60 tracking-[0.2em] uppercase">Estimated Subtotal</span>
                  <span className="font-primary text-[28px] font-bold text-primary flex items-baseline gap-1.5">
                    {cartTotal.toLocaleString()} <span className="font-ethiopic text-[18px] font-normal text-secondary/65">ብር</span>
                  </span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2.5 transition-all duration-300 rounded-full shadow-[0_8px_25px_rgba(5,150,105,0.25)] hover:shadow-[0_10px_30px_rgba(5,150,105,0.35)] active:scale-98 cursor-pointer"
                >
                  <PiWhatsappLogoLight size={22} />
                  <span className="font-secondary text-[14px] font-bold tracking-wide">
                    Order via WhatsApp
                  </span>
                </button>
                <div className="flex items-center justify-center gap-2 mt-3 text-secondary/50 font-secondary text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Direct consultation • Pay upon delivery or bank transfer</span>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
