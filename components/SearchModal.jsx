"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiMagnifyingGlassLight, PiXLight, PiArrowRightLight } from "react-icons/pi";
import { useProducts } from "@/context/ProductContext";
import ProductModal from "./ProductModal";

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

    const searchTerm = query.toLowerCase();
    const results = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) || 
      product.category.toLowerCase().includes(searchTerm)
    );
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
                    <div className="text-center py-20">
                      <p className="font-secondary text-secondary/50 text-lg">
                        Type to start searching across our entire collection...
                      </p>
                      <div className="flex gap-4 justify-center mt-6">
                        {["Sofa", "Chair", "Table", "Bed"].map(tag => (
                          <button 
                            key={tag}
                            onClick={() => setQuery(tag)}
                            className="px-6 py-2 rounded-full border border-secondary/10 font-secondary text-[13px] uppercase tracking-wider hover:border-gold hover:text-gold transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    <motion.div 
                      initial="hidden"
                      animate="visible"
                      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
                    >
                      {filteredProducts.map((product) => (
                        <motion.div
                          variants={itemVariants}
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="group flex flex-col bg-surface rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all border border-transparent hover:border-gold/20"
                        >
                          <div className="relative w-full aspect-[4/3] bg-[#FAFAFA] flex items-center justify-center p-4">
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-5 bg-white border-t border-secondary/5 flex items-center justify-between">
                            <div>
                              <span className="font-secondary text-[10px] font-bold tracking-widest uppercase text-gold block mb-1">
                                {product.category}
                              </span>
                              <h4 className="font-primary text-[16px] text-secondary font-medium">
                                {product.name}
                              </h4>
                              <span className="font-secondary text-[14px] text-secondary/60">
                                {product.price.toLocaleString()} ETB
                              </span>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-secondary/10 flex items-center justify-center text-secondary/40 group-hover:bg-gold group-hover:text-white group-hover:border-gold transition-colors">
                              <PiArrowRightLight size={18} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
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
