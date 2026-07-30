"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiXLight, PiCheckCircleFill, PiShoppingCartSimpleBold } from "react-icons/pi";
import { useCart } from "../context/CartContext";

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

const SWATCHES = [
  { id: "cream", color: "#F2E3D5", label: "cream" },
  { id: "grand", color: "#836A58", label: "grand" },
  { id: "taupe", color: "#948473", label: "taupe" },
  { id: "mocha", color: "#A47F6A", label: "mocha" },
  { id: "noir",  color: "#1F1F21", label: "noir" }
];

const ProductModal = ({ isOpen, onClose, product }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeSwatch, setActiveSwatch] = useState(SWATCHES[1]);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      setIsAdded(false);
      setActiveSwatch(SWATCHES[1]);
    }
  }, [isOpen, product]);

  const handleAddToCart = () => {
    if (isAdded) return;
    addToCart(product);
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
          className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6 bg-primary/20 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[800px] max-h-[95vh] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-primary/5 hover:bg-gold hover:text-white transition-colors duration-300 group"
              aria-label="Close modal"
            >
              <PiXLight className="text-secondary/60 group-hover:text-white text-xl transition-colors" />
            </button>

            {/* Inner Scrollable Container */}
            <div className="w-full flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              {/* Top: Swatches */}
            <div className="flex flex-col items-center mt-12 pt-2">
              <span className="font-secondary text-[12px] font-medium text-secondary tracking-wide mb-5">
                available finish
              </span>
              <div className="flex items-center gap-3">
                {SWATCHES.map((swatch) => {
                  const isActive = activeSwatch.id === swatch.id;
                  return (
                    <button
                      key={swatch.id}
                      onClick={() => setActiveSwatch(swatch)}
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-110' : 'hover:scale-110'}`}
                    >
                      <div 
                        className="w-full h-full rounded-full border border-black/10"
                        style={{ backgroundColor: swatch.color }}
                      />
                      {isActive && (
                        <motion.div 
                          layoutId="swatch-ring"
                          className="absolute inset-[-4px] rounded-full border-[1.5px] border-secondary/40"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
              <motion.div 
                key={activeSwatch.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 px-8 py-1.5 border border-secondary/20 rounded-full font-secondary text-[12px] text-secondary tracking-wide"
              >
                {activeSwatch.label}
              </motion.div>
            </div>

            {/* Middle: Product Image */}
            <div className="relative w-full flex justify-center items-center mt-8 px-10 h-[320px]">
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

            {/* Specs 4-columns */}
            <div className="mt-8 px-6 sm:px-12 grid grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center gap-4">
                <span className="font-secondary text-[11px] text-secondary font-medium tracking-wide">category</span>
                <span className="font-secondary text-[13px] text-secondary/80">{product.category}</span>
              </div>
              <div className="flex flex-col items-center gap-4">
                <span className="font-secondary text-[11px] text-secondary font-medium tracking-wide">dimensions</span>
                <span className="font-secondary text-[13px] text-secondary/80 leading-snug whitespace-pre-line">
                  {product.dimensions || "W:80cm\nD:85cm\nH:97cm"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-4">
                <span className="font-secondary text-[11px] text-secondary font-medium tracking-wide">structure</span>
                <span className="font-secondary text-[13px] text-secondary/80 leading-snug whitespace-pre-line">
                  {product.structure || "Solid ash wood\nhigh-resilience sponge"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-4">
                <span className="font-secondary text-[11px] text-secondary font-medium tracking-wide">finish</span>
                <span className="font-secondary text-[13px] text-secondary/80">
                  {product.finish || "Upholstery fabric"}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-8 mx-12 h-[1px] bg-secondary/10" />

            {/* Bottom: Pairing Suggestion / Gallery */}
            <div className="mt-6 flex flex-col items-center pb-8">
              <span className="font-secondary text-[12px] font-medium text-secondary tracking-wide mb-5">
                pairing suggestion
              </span>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 px-8">
                {product.images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#FAFAFA] flex items-center justify-center p-2 transition-all duration-300 ${activeImageIndex === idx ? 'ring-1 ring-secondary shadow-md scale-105' : 'hover:scale-105 border border-secondary/5'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="mt-auto bg-[#FAFAFA] border-t border-secondary/10 p-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-[2.5rem]">
              <div className="text-center sm:text-left">
                <h3 className="font-primary text-2xl text-secondary">{product.name}</h3>
                <p className="font-secondary text-gold text-lg mt-1">{product.price.toLocaleString()} ETB</p>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`relative h-12 px-8 flex items-center justify-center gap-2 rounded-full overflow-hidden transition-all duration-300 w-full sm:w-auto ${
                  isAdded 
                    ? "bg-emerald-500 text-white" 
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
                      Added
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
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
