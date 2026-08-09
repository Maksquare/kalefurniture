"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiXLight, PiCheckCircleFill, PiShoppingCartSimpleBold, PiHammerBold, PiPalette } from "react-icons/pi";
import { useCart } from "../context/CartContext";
import MadeToOrderModal from "./MadeToOrderModal";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeInOut", delay: 0.2 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20, 
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } 
  },
};

const DEFAULT_SWATCHES = [
  { id: "cream", color: "#F2E3D5", label: "cream" },
  { id: "grand", color: "#836A58", label: "grand" },
  { id: "taupe", color: "#948473", label: "taupe" },
  { id: "mocha", color: "#A47F6A", label: "mocha" },
  { id: "noir",  color: "#1F1F21", label: "noir" }
];

const ProductModal = ({ isOpen, onClose, product }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeSwatch, setActiveSwatch] = useState(null);
  const [customColor, setCustomColor] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isMadeToOrderOpen, setIsMadeToOrderOpen] = useState(false);
  const { addToCart } = useCart();

  // Normalize swatches from product
  const rawSwatches = product?.swatches || product?.colors;
  const hasSwatches = Array.isArray(rawSwatches) && rawSwatches.length > 0;
  const swatches = hasSwatches 
    ? rawSwatches.map((s, idx) => typeof s === "string" ? { id: `s-${idx}`, label: s, color: "#836A58" } : s)
    : (product?.allowCustomColor !== false ? DEFAULT_SWATCHES : []);

  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      setIsAdded(false);
      setCustomColor("");
      setIsCustomMode(false);
      if (swatches.length > 0) {
        setActiveSwatch(swatches[0]);
      } else {
        setActiveSwatch(null);
      }
    }
  }, [isOpen, product]);

  const getSelectedColorName = () => {
    if (isCustomMode && customColor.trim()) return customColor.trim();
    if (activeSwatch) return activeSwatch.label || activeSwatch.name || activeSwatch;
    return null;
  };

  const handleAddToCart = () => {
    if (isAdded) return;
    const colorToPass = getSelectedColorName();
    addToCart(product, colorToPass);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-6 bg-primary/30 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[800px] max-h-[90vh] bg-white rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/5 hover:bg-gold hover:text-white transition-colors duration-300 group"
              aria-label="Close modal"
            >
              <PiXLight className="text-secondary/60 group-hover:text-white text-xl transition-colors" />
            </button>

            {/* Inner Scrollable Container */}
            <div className="w-full flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              
              {/* 🎨 Top: Dynamic Swatches & Custom Color Option */}
              {(swatches.length > 0 || product.allowCustomColor) && (
                <div className="flex flex-col items-center mt-6 sm:mt-10 pt-2 px-6">
                  <span className="font-secondary text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-secondary/60 mb-3 flex items-center gap-1.5">
                    <PiPalette className="text-gold text-sm" /> Available Finish & Color
                  </span>

                  {/* Swatch palette */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {swatches.map((swatch, idx) => {
                      const swatchId = swatch.id || swatch.label || idx;
                      const isActive = !isCustomMode && activeSwatch?.label === swatch.label;
                      return (
                        <button
                          key={swatchId}
                          onClick={() => {
                            setActiveSwatch(swatch);
                            setIsCustomMode(false);
                          }}
                          className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-110' : 'hover:scale-110 opacity-80 hover:opacity-100'}`}
                          title={swatch.label}
                        >
                          <div 
                            className="w-full h-full rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: swatch.color || "#836A58" }}
                          />
                          {isActive && (
                            <motion.div 
                              layoutId="swatch-ring"
                              className="absolute inset-[-4px] rounded-full border-[2px] border-gold shadow-[0_0_10px_rgba(217,182,110,0.4)]"
                              transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            />
                          )}
                        </button>
                      );
                    })}

                    {/* Custom Color Button */}
                    {product.allowCustomColor !== false && (
                      <button
                        onClick={() => setIsCustomMode(!isCustomMode)}
                        className={`px-3 py-1 rounded-full font-secondary text-[11px] font-medium border transition-all duration-300 flex items-center gap-1 ${
                          isCustomMode
                            ? "bg-gold text-primary border-gold font-bold shadow-sm"
                            : "bg-secondary/5 text-secondary/70 border-secondary/15 hover:border-gold hover:text-gold"
                        }`}
                      >
                        <span>+ Custom Color</span>
                      </button>
                    )}
                  </div>

                  {/* Custom Color Input Field or Active Label */}
                  <AnimatePresence mode="wait">
                    {isCustomMode ? (
                      <motion.div
                        key="custom-input"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mt-3 flex items-center gap-2 bg-[#FAFAFA] border border-gold/40 rounded-full px-4 py-1.5 shadow-sm"
                      >
                        <span className="font-secondary text-[11px] font-bold text-gold uppercase tracking-wider">Custom:</span>
                        <input
                          type="text"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          placeholder="e.g. Royal Emerald, Charcoal Grey"
                          className="bg-transparent font-secondary text-[12px] text-secondary focus:outline-none w-48 sm:w-64"
                          autoFocus
                        />
                      </motion.div>
                    ) : activeSwatch ? (
                      <motion.div 
                        key={activeSwatch.label || activeSwatch.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 px-5 py-1 border border-secondary/15 rounded-full font-secondary text-[11px] sm:text-[12px] text-secondary tracking-wide capitalize"
                      >
                        {activeSwatch.label}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              )}

              {/* Middle: Product Image */}
              <div className="relative w-full flex justify-center items-center mt-4 sm:mt-6 px-6 sm:px-10 h-[220px] sm:h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={product.images[activeImageIndex]}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="w-full h-full object-contain"
                  />
                </AnimatePresence>
              </div>

              {/* Specs Grid */}
              <div className="mt-6 sm:mt-8 px-4 sm:px-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center gap-1 sm:gap-2 p-3 bg-[#FAFAFA] rounded-2xl border border-secondary/5">
                  <span className="font-secondary text-[10px] sm:text-[11px] text-gold font-bold uppercase tracking-wider">category</span>
                  <span className="font-secondary text-[12px] sm:text-[13px] text-secondary/80 font-medium">{product.category}</span>
                </div>
                <div className="flex flex-col items-center gap-1 sm:gap-2 p-3 bg-[#FAFAFA] rounded-2xl border border-secondary/5">
                  <span className="font-secondary text-[10px] sm:text-[11px] text-gold font-bold uppercase tracking-wider">dimensions</span>
                  <span className="font-secondary text-[12px] sm:text-[13px] text-secondary/80 leading-snug whitespace-pre-line">
                    {product.dimensions || "W:80cm\nD:85cm\nH:97cm"}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 sm:gap-2 p-3 bg-[#FAFAFA] rounded-2xl border border-secondary/5">
                  <span className="font-secondary text-[10px] sm:text-[11px] text-gold font-bold uppercase tracking-wider">structure</span>
                  <span className="font-secondary text-[12px] sm:text-[13px] text-secondary/80 leading-snug whitespace-pre-line">
                    {product.structure || "Solid ash wood\nhigh-resilience sponge"}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 sm:gap-2 p-3 bg-[#FAFAFA] rounded-2xl border border-secondary/5">
                  <span className="font-secondary text-[10px] sm:text-[11px] text-gold font-bold uppercase tracking-wider">finish</span>
                  <span className="font-secondary text-[12px] sm:text-[13px] text-secondary/80 leading-snug whitespace-pre-line">
                    {product.finish || "Upholstery fabric"}
                  </span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-6 px-6 sm:px-12 text-center">
                  <p className="font-secondary text-[13px] text-secondary/70 max-w-xl mx-auto leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Gallery Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="mt-6 flex flex-col items-center pb-6">
                  <span className="font-secondary text-[11px] font-bold uppercase tracking-widest text-secondary/40 mb-3">
                    Gallery Views
                  </span>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 px-8">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#FAFAFA] flex items-center justify-center p-1.5 transition-all duration-300 ${activeImageIndex === idx ? 'ring-2 ring-gold shadow-md scale-105' : 'hover:scale-105 border border-secondary/10 opacity-70 hover:opacity-100'}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sticky Action Footer */}
              <div className="mt-auto bg-[#FAFAFA] border-t border-secondary/10 p-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-[2.5rem]">
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-primary text-2xl text-secondary">{product.name}</h3>
                    {product.outOfStock && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-secondary text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                        Made To Order
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="font-secondary text-gold text-lg font-semibold">{(product.price || 0).toLocaleString()} ETB</p>
                    {getSelectedColorName() && (
                      <span className="font-secondary text-[11px] text-secondary/60 bg-secondary/5 px-2.5 py-0.5 rounded-full border border-secondary/10 capitalize">
                        Selected: <strong className="text-secondary">{getSelectedColorName()}</strong>
                      </span>
                    )}
                  </div>
                </div>
                
                {product.outOfStock ? (
                  <button
                    onClick={() => setIsMadeToOrderOpen(true)}
                    className="relative h-12 px-8 flex items-center justify-center gap-2.5 rounded-full overflow-hidden transition-all duration-300 w-full sm:w-auto bg-amber-700 text-white hover:bg-amber-800 shadow-[0_4px_20px_rgba(180,83,9,0.3)] hover:shadow-[0_6px_25px_rgba(180,83,9,0.45)] group cursor-pointer"
                  >
                    <PiHammerBold size={18} className="text-gold group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-secondary text-[12px] font-bold tracking-widest uppercase">
                      Order to be Made
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`relative h-12 px-8 flex items-center justify-center gap-2 rounded-full overflow-hidden transition-all duration-300 w-full sm:w-auto shadow-md ${
                      isAdded 
                        ? "bg-emerald-600 text-white" 
                        : "bg-primary text-white hover:bg-gold hover:shadow-lg"
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {isAdded ? (
                        <motion.div
                          key="added"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 font-secondary text-[12px] font-semibold tracking-widest uppercase"
                        >
                          <PiCheckCircleFill size={18} />
                          Added {getSelectedColorName() ? `(${getSelectedColorName()})` : ""}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="add"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 font-secondary text-[12px] font-semibold tracking-widest uppercase"
                        >
                          <PiShoppingCartSimpleBold size={16} />
                          Add to Cart
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Made-To-Order Request Modal */}
      <MadeToOrderModal 
        isOpen={isMadeToOrderOpen}
        onClose={() => setIsMadeToOrderOpen(false)}
        product={{ ...product, selectedColor: getSelectedColorName() }}
      />
    </AnimatePresence>
  );
};

export default ProductModal;
