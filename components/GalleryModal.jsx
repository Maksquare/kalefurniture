"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiXLight } from "react-icons/pi";
import ProductModal from "./ProductModal";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
      delayChildren: 0.2
    } 
  },
  exit: { opacity: 0, y: 30, scale: 0.98, transition: { duration: 0.3, ease: "easeInOut" } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const GalleryModal = ({ isOpen, onClose, category }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();
  const { products: allProducts } = useProducts();

  // Prevent body scroll when either modal is open
  useEffect(() => {
    if (isOpen || selectedProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, selectedProduct]);

  const products = allProducts.filter((p) => p.category === category);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 xl:p-12 bg-primary/90 backdrop-blur-xl"
            onClick={onClose}
          >
            {/* Modal Container */}
            <motion.div
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-7xl h-full max-h-[90vh] bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 xl:p-10 border-b border-white/[0.04] bg-primary/50 backdrop-blur-md z-10 shrink-0">
                <div>
                  <h3 className="font-secondary text-[11px] font-semibold tracking-[0.2em] uppercase text-gold mb-2">
                    Collection Gallery
                  </h3>
                  <h2 className="font-primary text-[28px] md:text-[36px] text-white leading-none">
                    {category}
                  </h2>
                </div>
                
                <button 
                  onClick={onClose}
                  className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] hover:bg-gold hover:border-gold transition-all duration-300"
                  aria-label="Close modal"
                >
                  <PiXLight className="text-white/70 group-hover:text-primary text-2xl transition-colors duration-300" />
                </button>
              </div>

              {/* Gallery Grid (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 xl:p-10 custom-scrollbar">
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                  {products.map((product, idx) => (
                    <motion.div 
                      key={product.id}
                      variants={itemVariants}
                      className="relative w-full overflow-hidden rounded-lg group break-inside-avoid"
                    >
                      <div className="cursor-pointer" onClick={() => setSelectedProduct({ ...product, category })}>
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
                        <div className="pointer-events-auto flex flex-col">
                          <h4 
                            className="font-primary text-[24px] text-white mb-1 cursor-pointer" 
                            onClick={() => setSelectedProduct({ ...product, category })}
                          >
                            {product.name}
                          </h4>
                          <p className="font-secondary text-[14px] text-white/70 mb-4">{product.price.toLocaleString()} ETB</p>
                          
                          <div className="flex items-center justify-between gap-4">
                            <span 
                              className="inline-flex items-center text-gold font-secondary text-[11px] font-semibold tracking-widest uppercase cursor-pointer hover:text-white transition-colors"
                              onClick={() => setSelectedProduct({ ...product, category })}
                            >
                              View Details
                            </span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart({ ...product, category });
                              }}
                              className="px-4 py-2 bg-white/[0.08] hover:bg-gold text-white hover:text-primary rounded-full transition-colors duration-300 font-secondary text-[10px] font-bold tracking-wider uppercase"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {products.length === 0 && (
                  <div className="h-full flex items-center justify-center text-white/50 font-secondary text-sm tracking-widest uppercase">
                    No items available for this collection yet.
                  </div>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <ProductModal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
      />
    </>
  );
};

export default GalleryModal;
