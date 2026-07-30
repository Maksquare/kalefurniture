"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiShoppingCartLight, PiMagnifyingGlassLight, PiStarFill, PiFadersLight, PiXLight, PiCheckLight, PiCrownLight, PiSparkleLight, PiStarLight } from "react-icons/pi";
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import ProductModal from "./ProductModal";

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under 50,000 ETB", min: 0, max: 50000 },
  { label: "50,000 - 150,000 ETB", min: 50000, max: 150000 },
  { label: "Over 150,000 ETB", min: 150000, max: Infinity },
];

const HIGHLIGHTS = [
  { label: "All", id: "All", icon: null },
  { label: "Best Seller", id: "bestSeller", icon: PiCrownLight },
  { label: "New Arrival", id: "isNew", icon: PiSparkleLight },
  { label: "Featured", id: "featured", icon: PiStarLight },
];

const CollectionsGrid = () => {
  const { products, isLoaded } = useProducts();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Advanced Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState(PRICE_RANGES[0]);
  const [selectedHighlight, setSelectedHighlight] = useState("All");

  // Extract unique filters
  const categories = useMemo(() => {
    if (!products.length) return ["All"];
    return ["All", ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  const availableColors = useMemo(() => {
    if (!products.length) return ["All"];
    const colors = products.map(p => p.color).filter(Boolean);
    return ["All", ...Array.from(new Set(colors))];
  }, [products]);

  const availableTypes = useMemo(() => {
    if (!products.length) return ["All"];
    const types = products.map(p => p.type).filter(Boolean);
    return ["All", ...Array.from(new Set(types))];
  }, [products]);

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Text Search
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
      // Category
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      // Color
      const matchesColor = selectedColor === "All" || product.color === selectedColor;
      // Type
      const matchesType = selectedType === "All" || product.type === selectedType;
      // Price
      const matchesPrice = product.price >= selectedPrice.min && product.price <= selectedPrice.max;
      // Highlight
      const matchesHighlight = selectedHighlight === "All" || product[selectedHighlight] === true;

      return matchesSearch && matchesCategory && matchesColor && matchesType && matchesPrice && matchesHighlight;
    });
  }, [products, searchQuery, activeCategory, selectedColor, selectedType, selectedPrice, selectedHighlight]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setSelectedColor("All");
    setSelectedType("All");
    setSelectedPrice(PRICE_RANGES[0]);
    setSelectedHighlight("All");
  };

  const activeFilterCount = (selectedColor !== "All" ? 1 : 0) + 
                            (selectedType !== "All" ? 1 : 0) + 
                            (selectedPrice.label !== "All Prices" ? 1 : 0) +
                            (selectedHighlight !== "All" ? 1 : 0);

  if (!isLoaded) return null;

  return (
    <section className="py-10 bg-surface min-h-[50vh]">
      <div className="container">
        
        {/* Search & Main Category Bar */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center mb-6">
          
          {/* Category Chips */}
          <div className="flex overflow-x-auto gap-2 pb-2 lg:pb-0 w-full lg:w-auto custom-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 px-4 py-1.5 rounded-full font-secondary text-[11px] font-semibold tracking-widest uppercase transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white border border-secondary/10 text-secondary/60 hover:border-gold hover:text-gold"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search & Filter Toggle */}
          <div className="flex w-full lg:w-auto gap-3">
            <div className="relative flex-1 lg:w-[350px]">
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-6 bg-white border border-secondary/10 rounded-full font-secondary text-[14px] text-secondary outline-none focus:border-gold/40 focus:shadow-[0_4px_20px_rgba(221,182,125,0.15)] transition-all duration-300"
              />
              <PiMagnifyingGlassLight className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 text-xl" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary">
                  <PiXLight size={16} />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 h-12 px-6 rounded-full border transition-all duration-300 shadow-sm ${
                showFilters || activeFilterCount > 0
                  ? "bg-gold border-gold text-primary shadow-gold/20"
                  : "bg-white border-secondary/10 text-secondary hover:border-gold hover:text-gold"
              }`}
            >
              <PiFadersLight size={20} />
              <span className="font-secondary text-[13px] font-bold uppercase tracking-wider hidden sm:block">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold ml-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 48 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 md:p-8 bg-white border border-secondary/10 rounded-3xl shadow-lg mt-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-primary text-[22px] text-secondary">Refine Your Search</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="font-secondary text-[12px] uppercase tracking-widest text-gold hover:text-primary transition-colors font-bold">
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Price Filter */}
                  <div>
                    <h4 className="font-secondary text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/50 mb-3">Price Range</h4>
                    <div className="flex flex-col gap-2.5">
                      {PRICE_RANGES.map((range) => (
                        <button
                          key={range.label}
                          onClick={() => setSelectedPrice(range)}
                          className="flex items-center gap-3 group text-left"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedPrice.label === range.label ? "bg-gold border-gold" : "bg-transparent border-secondary/20 group-hover:border-gold"}`}>
                            {selectedPrice.label === range.label && <PiCheckLight className="text-white text-[10px]" />}
                          </div>
                          <span className={`font-secondary text-[13px] transition-colors ${selectedPrice.label === range.label ? "text-secondary font-medium" : "text-secondary/70 group-hover:text-secondary"}`}>
                            {range.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Highlights Filter */}
                  <div>
                    <h4 className="font-secondary text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/50 mb-3">Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {HIGHLIGHTS.map((hl) => {
                        const Icon = hl.icon;
                        return (
                          <button
                            key={hl.id}
                            onClick={() => setSelectedHighlight(hl.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-secondary text-[11px] font-medium tracking-wide border transition-all ${
                              selectedHighlight === hl.id
                                ? "bg-secondary text-white border-secondary"
                                : "bg-transparent border-secondary/10 text-secondary/70 hover:border-secondary/30 hover:bg-secondary/5"
                            }`}
                          >
                            {Icon && <Icon size={14} className={selectedHighlight === hl.id ? "text-gold" : "text-secondary/40"} />}
                            {hl.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Filter */}
                  <div>
                    <h4 className="font-secondary text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/50 mb-3">Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-1.5 rounded-full font-secondary text-[11px] font-medium tracking-wide border transition-all ${
                            selectedColor === color
                              ? "bg-secondary text-white border-secondary"
                              : "bg-transparent border-secondary/10 text-secondary/70 hover:border-secondary/30 hover:bg-secondary/5"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <h4 className="font-secondary text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/50 mb-3">Product Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`px-3 py-1.5 rounded-full font-secondary text-[11px] font-medium tracking-wide border transition-all ${
                            selectedType === type
                              ? "bg-secondary text-white border-secondary"
                              : "bg-transparent border-secondary/10 text-secondary/70 hover:border-secondary/30 hover:bg-secondary/5"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center text-secondary/60 font-secondary text-[14px]">
          <span>Showing <strong className="text-secondary">{filteredProducts.length}</strong> results</span>
        </div>

        {/* Results Grid */}
        <AnimatePresence mode="popLayout">
          {filteredProducts.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.5) }}
                  key={product.id}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-secondary/5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 relative"
                >
                  {/* Image Area */}
                  <div 
                    className="relative w-full aspect-[4/5] bg-[#FAFAFA] flex items-center justify-center p-6 cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Category Tag overlay */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary">
                      {product.category}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-5 border-t border-secondary/5 flex-1 flex flex-col justify-between bg-white z-10">
                    <div>
                      <h3 
                        className="font-primary text-[17px] font-medium text-secondary truncate mb-1 cursor-pointer hover:text-gold transition-colors"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.name}
                      </h3>
                      
                      {/* Rating Stars */}
                      {product.sales_count >= 5 ? (
                        <div className="flex gap-1 text-gold mb-4">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = product.sales_count >= 10 ? true : star <= 4;
                            return isFilled ? (
                              <PiStarFill key={star} size={10} />
                            ) : (
                              <PiStarLight key={star} size={10} />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="mb-4 h-[10px]" /> /* spacer to maintain layout */
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-secondary text-[16px] font-semibold text-secondary">
                        {product.price.toLocaleString()} ETB
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="text-secondary/60 hover:text-gold transition-colors flex items-center gap-1.5 font-secondary text-[11px] uppercase tracking-wider font-bold"
                      >
                        <PiShoppingCartLight size={18} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-secondary/5 flex items-center justify-center mb-6">
                <PiMagnifyingGlassLight className="text-3xl text-secondary/40" />
              </div>
              <h3 className="font-primary text-[28px] text-secondary mb-2">No items found</h3>
              <p className="font-secondary text-secondary/60 text-[16px] max-w-md text-center">
                We couldn't find any products matching your current filters.
              </p>
              <button 
                onClick={clearAllFilters}
                className="mt-8 px-8 py-3 rounded-full bg-primary text-white font-secondary text-[13px] uppercase tracking-widest hover:bg-gold transition-colors"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      <ProductModal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
      />
    </section>
  );
};

export default CollectionsGrid;
