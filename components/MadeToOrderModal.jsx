"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PiXLight, 
  PiHammerLight, 
  PiSparkleFill, 
  PiWhatsappLogoFill, 
  PiCheckCircleFill, 
  PiClockLight, 
  PiRulerLight, 
  PiPaletteLight,
  PiPhoneLight,
  PiUserLight
} from "react-icons/pi";
import toast from "react-hot-toast";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 25 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 15, 
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } 
  },
};

const WOOD_FINISHES = ["Natural Oak", "Walnut Veneer", "Solid Ash Wood", "Ebonized Ash", "Raw Teak"];
const FABRIC_OPTIONS = ["Bouclé", "Velvet", "Top-Grain Leather", "Linen Blend", "Custom Fabric"];

export default function MadeToOrderModal({ isOpen, onClose, product }) {
  const [selectedWood, setSelectedWood] = useState(WOOD_FINISHES[0]);
  const [selectedFabric, setSelectedFabric] = useState(FABRIC_OPTIONS[0]);
  const [customNotes, setCustomNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsSubmitted(false);
      setIsSubmitting(false);
      setSelectedWood(WOOD_FINISHES[0]);
      setSelectedFabric(FABRIC_OPTIONS[0]);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, product]);

  if (!product) return null;

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    if (!customerPhone || !customerName) {
      toast.error("Please enter your name and phone number");
      return;
    }

    const phoneNumber = "251900000000"; // Kal Furniture contact phone / WhatsApp
    const messageLines = [
      `🏛️ *KAL FURNITURE - MADE TO ORDER REQUEST*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `*Product:* ${product.name}`,
      `*Estimated Base Price:* ${product.price.toLocaleString()} ETB`,
      `*Wood Finish Preference:* ${selectedWood}`,
      `*Upholstery Fabric:* ${selectedFabric}`,
      customNotes ? `*Custom Notes / Dimensions:* ${customNotes}` : null,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `*Customer Name:* ${customerName}`,
      `*Customer Phone:* ${customerPhone}`,
      `*Request Date:* ${new Date().toLocaleDateString()}`
    ].filter(Boolean);

    const message = messageLines.join("\n");
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Order request prepared!");
    }, 600);
  };

  const handleDirectRequestSubmit = (e) => {
    e.preventDefault();
    if (!customerPhone || !customerName) {
      toast.error("Please enter your name and phone number");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Made-to-Order Request Sent Successfully!");
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-primary/40 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#FCFAF7] rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.35)] border border-gold/20 flex flex-col max-h-[92vh]"
          >
            {/* Elegant Ambient Top Glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold/20 via-gold to-gold/20" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-white/60 backdrop-blur-md border-b border-secondary/10 relative">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-inner shrink-0">
                  <PiHammerLight size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold font-secondary text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-gold/30">
                      Made To Order
                    </span>
                    <span className="font-secondary text-[10px] sm:text-[11px] text-secondary/50 flex items-center gap-1">
                      <PiClockLight size={13} /> 2–3 Weeks
                    </span>
                  </div>
                  <h2 className="font-primary text-[18px] sm:text-[26px] text-secondary leading-tight mt-0.5">
                    Custom Craftsmanship Request
                  </h2>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-secondary/5 hover:bg-gold hover:text-white transition-colors duration-300 group shrink-0"
                aria-label="Close modal"
              >
                <PiXLight className="text-secondary/60 group-hover:text-white text-lg sm:text-xl transition-colors" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-6">
              {isSubmitted ? (
                /* Success View */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center flex flex-col items-center justify-center"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-xl border border-emerald-200">
                    <PiCheckCircleFill size={48} />
                  </div>
                  <h3 className="font-primary text-[28px] text-secondary mb-2">
                    Request Received
                  </h3>
                  <p className="font-secondary text-[14px] text-secondary/70 max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you, <strong className="text-secondary">{customerName}</strong>! Our master artisans at Kal Furniture will review your custom order details for <span className="text-gold font-medium">{product.name}</span> and contact you shortly at <span className="font-semibold text-secondary">{customerPhone}</span>.
                  </p>

                  <div className="bg-white p-5 rounded-2xl border border-secondary/10 w-full max-w-md text-left space-y-2 mb-8 shadow-sm">
                    <div className="flex justify-between font-secondary text-[12px]">
                      <span className="text-secondary/60">Selected Wood:</span>
                      <span className="font-semibold text-secondary">{selectedWood}</span>
                    </div>
                    <div className="flex justify-between font-secondary text-[12px]">
                      <span className="text-secondary/60">Fabric Finish:</span>
                      <span className="font-semibold text-secondary">{selectedFabric}</span>
                    </div>
                    <div className="flex justify-between font-secondary text-[12px]">
                      <span className="text-secondary/60">Estimated Delivery:</span>
                      <span className="font-semibold text-gold">2 - 3 Weeks</span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="px-8 py-3.5 bg-secondary text-white hover:bg-gold font-secondary text-[11px] font-bold uppercase tracking-widest rounded-full shadow-lg transition-all"
                  >
                    Done & Close
                  </button>
                </motion.div>
              ) : (
                /* Custom Order Form */
                <form onSubmit={handleDirectRequestSubmit} className="space-y-6">
                  {/* Product Preview Card */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-secondary/10 flex items-center gap-4 shadow-sm">
                    <div className="w-20 h-20 rounded-xl bg-[#FAFAFA] flex items-center justify-center shrink-0 border border-secondary/5 overflow-hidden">
                      <img 
                        src={product.images ? product.images[0] : ''} 
                        alt={product.name} 
                        className="w-full h-full object-contain mix-blend-multiply p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-secondary text-[10px] font-bold uppercase tracking-widest text-gold">
                        {product.category}
                      </span>
                      <h4 className="font-primary text-[18px] text-secondary truncate">
                        {product.name}
                      </h4>
                      <p className="font-secondary text-[14px] text-secondary/80 font-semibold mt-0.5">
                        Base Price: {product.price.toLocaleString()} ETB
                      </p>
                    </div>
                  </div>

                  {/* Crafting Customization Options */}
                  <div className="space-y-4">
                    <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/70 flex items-center gap-2">
                      <PiPaletteLight size={16} className="text-gold" />
                      1. Preferred Wood & Finish
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {WOOD_FINISHES.map((wood) => (
                        <button
                          key={wood}
                          type="button"
                          onClick={() => setSelectedWood(wood)}
                          className={`px-3 py-2.5 rounded-xl font-secondary text-[12px] font-medium border text-left transition-all ${
                            selectedWood === wood
                              ? "bg-gold/10 border-gold text-secondary shadow-sm font-semibold"
                              : "bg-white border-secondary/15 text-secondary/70 hover:border-gold/50"
                          }`}
                        >
                          {wood}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/70 flex items-center gap-2">
                      <PiSparkleFill size={15} className="text-gold" />
                      2. Upholstery & Finish Material
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {FABRIC_OPTIONS.map((fabric) => (
                        <button
                          key={fabric}
                          type="button"
                          onClick={() => setSelectedFabric(fabric)}
                          className={`px-3 py-2.5 rounded-xl font-secondary text-[12px] font-medium border text-left transition-all ${
                            selectedFabric === fabric
                              ? "bg-gold/10 border-gold text-secondary shadow-sm font-semibold"
                              : "bg-white border-secondary/15 text-secondary/70 hover:border-gold/50"
                          }`}
                        >
                          {fabric}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/70 flex items-center gap-2">
                      <PiRulerLight size={16} className="text-gold" />
                      3. Custom Notes or Dimensions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="Specify custom measurements, stain preference, or special requests..."
                      className="w-full bg-white border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[13px] text-secondary placeholder:text-secondary/40 focus:outline-none focus:border-gold transition-colors resize-none"
                    />
                  </div>

                  {/* Customer Information */}
                  <div className="pt-4 border-t border-secondary/10 space-y-4">
                    <h3 className="font-primary text-[18px] text-secondary">
                      Your Contact Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60 flex items-center gap-1.5">
                          <PiUserLight size={14} /> Full Name *
                        </label>
                        <input
                          required
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Abebe Bikila"
                          className="w-full bg-white border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[13px] text-secondary focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-secondary text-[11px] font-bold tracking-widest uppercase text-secondary/60 flex items-center gap-1.5">
                          <PiPhoneLight size={14} /> Phone / WhatsApp *
                        </label>
                        <input
                          required
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="e.g. +251 91 123 4567"
                          className="w-full bg-white border border-secondary/20 rounded-xl px-4 py-3 font-secondary text-[13px] text-secondary focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-4 border-t border-secondary/10 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleWhatsAppSubmit}
                      className="w-full sm:w-1/2 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-secondary text-[11px] font-bold tracking-widest uppercase rounded-full flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      <PiWhatsappLogoFill size={20} />
                      Send via WhatsApp
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-1/2 py-3.5 px-5 bg-gold hover:bg-gold-dark text-primary font-secondary text-[11px] font-bold tracking-widest uppercase rounded-full flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(217,182,110,0.35)] hover:shadow-[0_6px_25px_rgba(217,182,110,0.45)] transition-all"
                    >
                      <PiHammerLight size={18} />
                      {isSubmitting ? "Submitting..." : "Request Craftsmanship"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
