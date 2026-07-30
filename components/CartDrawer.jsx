"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiXLight, PiTrashLight, PiMinusLight, PiPlusLight, PiWhatsappLogoLight } from "react-icons/pi";
import { useCart } from "../context/CartContext";
import { incrementSalesCount } from "@/app/actions/checkout";

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
    const phoneNumber = "1234567890"; // Placeholder number
    const intro = "Hello Kal Furniture, I would like to order:%0A%0A";
    const itemsList = cartItems
      .map(
        (item) =>
          `- ${item.quantity}x *${item.name}* (${item.price.toLocaleString()} ETB)`
      )
      .join("%0A");
    
    const totalLine = `%0A%0A*Total: ${cartTotal.toLocaleString()} ETB*`;
    const message = intro + itemsList + totalLine;

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");

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
            <div className="flex items-center justify-between p-6 border-b border-primary/10">
              <div className="flex items-center gap-4">
                <h2 className="font-primary text-2xl text-secondary">Your Cart</h2>
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[10px] font-secondary uppercase tracking-widest text-red-500/80 hover:text-red-500 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/5 hover:bg-gold hover:text-white transition-colors duration-300 group"
              >
                <PiXLight className="text-xl text-secondary/70 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                    <PiWhatsappLogoLight className="text-3xl text-secondary/30" />
                  </div>
                  <h3 className="font-primary text-xl text-secondary mb-2">Your cart is empty</h3>
                  <p className="font-secondary text-sm text-secondary/50 mb-6">Looks like you haven't added any items yet.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-3 border border-secondary/20 text-secondary/80 font-secondary text-[11px] tracking-widest uppercase hover:bg-secondary hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      {/* Thumbnail */}
                      <div className="w-24 h-24 rounded-md overflow-hidden bg-white shrink-0 relative border border-primary/5">
                        <img src={item.images ? item.images[0] : item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      {/* Info */}
                      <div className="flex flex-col flex-1 py-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-primary text-lg text-secondary leading-tight">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-secondary/40 hover:text-red-500 transition-colors"
                          >
                            <PiTrashLight size={18} />
                          </button>
                        </div>
                        <p className="font-secondary text-sm text-gold mb-3">{item.price.toLocaleString()} ETB</p>
                        
                        {/* Quantity Controls */}
                        <div className="mt-auto flex items-center gap-4">
                          <div className="flex items-center bg-primary/5 rounded-full border border-primary/10">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center text-secondary/70 hover:text-secondary"
                            >
                              <PiMinusLight size={14} />
                            </button>
                            <span className="w-6 text-center font-secondary text-sm text-secondary">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center text-secondary/70 hover:text-secondary"
                            >
                              <PiPlusLight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-primary/10 bg-ivory">
                <div className="flex justify-between items-end mb-6">
                  <span className="font-secondary text-sm text-secondary/60 tracking-wider uppercase">Subtotal</span>
                  <span className="font-primary text-3xl text-secondary">{cartTotal.toLocaleString()} ETB</span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-3 transition-colors duration-300 rounded-sm"
                >
                  <PiWhatsappLogoLight size={20} />
                  <span className="font-secondary text-xs font-semibold tracking-widest uppercase">
                    Checkout via WhatsApp
                  </span>
                </button>
                <p className="text-center font-secondary text-[11px] text-secondary/40 mt-4">
                  Taxes and shipping calculated at checkout.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
