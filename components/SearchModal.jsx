"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiMagnifyingGlassLight, PiXLight, PiArrowRightLight } from "react-icons/pi";
import { useProducts } from "@/context/ProductContext";
import ProductModal from "./ProductModal";
import { resolveImageUrl } from "@/lib/imageUtils";
import { efficientSearchProducts, parseProductCode } from "@/lib/catalogIntelligence";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeInOut", delay: 0.1 } }
};

const modalVariants = {
  hidden: { y: "-100%", opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 300, damping: 30 } 
  },
  exit: { y: "-100%", opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const QUICK_SUGGESTIONS = [
  "KSF001",
  "KKC001",
  "Living Room",
  "Sofa",
  "Kitchen Cabinet",
  "Dining Room",
  "Bedroom",
  "Home Office"
];

const SearchModal = ({ isOpen, onClose }) => {
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setQuery("");
      setFilteredProducts([]);
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      return;
    }

    // High-performance weighted multi-attribute search
    const results = efficientSearchProducts(products, query);
    setFilteredProducts(results);
  }, [query, products]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex flex-col"
            onClick={onClose}
          >
            <motion.div
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: "75vh" }}
            >
              {/* Search Header */}
              <div className="container relative border-b border-secondary/10 flex items-center py-6">
                <PiMagnifyingGlassLight className="text-secondary/50 text-3xl mr-4" />
                <input 
                  ref={inputRef}
                  type="text"
                  placeholder="Search for furniture, collections, or styles..."
                  className="flex-1 bg-transparent border-none outline-none font-primary text-[24px] md:text-[32px] text-secondary placeholder:text-secondary/30"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                  onClick={onClose}
                  className="ml-4 w-12 h-12 flex items-center justify-center rounded-full bg-surface hover:bg-gold hover:text-white transition-colors group"
                >
                  <PiXLight className="text-secondary/60 group-hover:text-white text-2xl transition-colors" />
                </button>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="container py-10">
                  {!query.trim() ? (
                    <div className="text-center py-16 max-w-xl mx-auto">
                      <p className="font-secondary text-secondary/60 text-base mb-2">
                        Instant search across furniture codes (e.g. <span className="font-bold text-gold">KSF001</span>, <span className="font-bold text-gold">KKC001</span>), styles, materials & rooms.
                      </p>
                      <span className="font-secondary text-[11px] font-bold uppercase tracking-widest text-secondary/40 block mb-4">
                        Quick Suggestions
                      </span>
                      <div className="flex flex-wrap gap-2.5 justify-center">
                        {QUICK_SUGGESTIONS.map(tag => (
                          <button 
                            key={tag}
                            onClick={() => setQuery(tag)}
                            className="px-4 py-2 rounded-full border border-secondary/15 font-secondary text-[12px] font-medium text-secondary/70 hover:border-gold hover:text-gold hover:bg-gold/5 transition-all cursor-pointer shadow-2xs"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-6 pb-2 border-b border-secondary/8">
                        <span className="font-secondary text-[12px] text-secondary/60">
                          Found <strong className="text-secondary font-bold">{filteredProducts.length}</strong> matching pieces for "{query}"
                        </span>
                        <span className="font-secondary text-[11px] text-gold uppercase tracking-wider font-semibold">
                          Ranked by Relevance
                        </span>
                      </div>

                      <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
                      >
                        {filteredProducts.map((product) => {
                          const parsedCode = parseProductCode(product.name || product.code);

                          return (
                            <motion.div
                              variants={itemVariants}
                              key={product.id}
                              onClick={() => handleProductClick(product)}
                              className="group flex flex-col bg-surface rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all border border-transparent hover:border-gold/20"
                            >
                              <div className="relative w-full aspect-[4/3] bg-[#F6F3EC] overflow-hidden">
                                <img 
                                  src={resolveImageUrl(product.images?.[0])} 
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {parsedCode && (
                                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs text-primary font-secondary text-[10px] font-bold tracking-wider uppercase border border-black/5 shadow-xs">
                                    {parsedCode.formattedCode}
                                  </span>
                                )}
                              </div>
                              <div className="p-5 bg-white border-t border-secondary/5 flex items-center justify-between">
                                <div className="min-w-0 pr-2">
                                  <span className="font-secondary text-[10px] font-bold tracking-widest uppercase text-gold block mb-1">
                                    {product.category}
                                  </span>
                                  <h4 className="font-primary text-[16px] text-secondary font-medium truncate">
                                    {product.name}
                                  </h4>
                                  <span className="font-secondary text-[14px] text-secondary/60">
                                    {product.price.toLocaleString()} <span className="font-ethiopic text-[13px]">ብር</span>
                                  </span>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-secondary/10 flex items-center justify-center text-secondary/40 group-hover:bg-gold group-hover:text-white group-hover:border-gold transition-colors shrink-0">
                                  <PiArrowRightLight size={18} />
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <p className="font-primary text-[24px] text-secondary mb-2">No results found for "{query}"</p>
                      <p className="font-secondary text-secondary/50">Try checking your spelling or using more general terms.</p>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductModal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
      />
    </>
  );
};

export default SearchModal;
