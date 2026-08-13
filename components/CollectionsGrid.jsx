"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PiShoppingCartLight, 
  PiMagnifyingGlassLight, 
  PiStarFill, 
  PiFadersLight, 
  PiXLight, 
  PiCheckLight, 
  PiCrownLight, 
  PiSparkleLight, 
  PiStarLight, 
  PiHammerLight,
  PiCaretLeftLight,
  PiCaretRightLight,
  PiSlidersHorizontalLight
} from "react-icons/pi";
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

const PAGE_SIZE_OPTIONS = [12, 24, 48];

const CollectionsGrid = () => {
  const { products, isLoaded } = useProducts();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const searchParams = useSearchParams();
  const productIdFromQuery = searchParams ? searchParams.get("product") : null;

  useEffect(() => {
    if (productIdFromQuery && products && products.length > 0) {
      const found = products.find(
        (p) => String(p.id) === String(productIdFromQuery)
      );
      if (found) {
        setSelectedProduct(found);
      }
    }
  }, [productIdFromQuery, products]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Advanced Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState(PRICE_RANGES[0]);
  const [selectedHighlight, setSelectedHighlight] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Extract unique filters
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, selectedColor, selectedType, selectedPrice, selectedHighlight, itemsPerPage]);

  // Compute pagination bounds
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const gridElem = document.getElementById("collections-grid-top");
    if (gridElem) {
      gridElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPageNumbers = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }
    if (current >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

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

        {/* Results Info & Items Per Page Bar */}
        <div id="collections-grid-top" className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-secondary/60 font-secondary text-[13px] border-b border-secondary/10 pb-4">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-secondary font-semibold">{filteredProducts.length > 0 ? startIndex + 1 : 0}–{endIndex}</strong> of <strong className="text-secondary font-semibold">{filteredProducts.length}</strong> curated pieces
            </span>
          </div>

          {/* Items Per Page Selector */}
          {filteredProducts.length > 12 && (
            <div className="flex items-center gap-2.5">
              <span className="text-secondary/50 uppercase tracking-widest text-[10px] font-bold flex items-center gap-1">
                <PiSlidersHorizontalLight size={14} className="text-gold" />
                View:
              </span>
              <div className="flex items-center gap-1 bg-white border border-secondary/10 rounded-full p-1 shadow-sm">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setItemsPerPage(size); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-all ${
                      itemsPerPage === size
                        ? "bg-primary text-white shadow-sm"
                        : "text-secondary/60 hover:text-gold"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Grid */}
        <AnimatePresence mode="popLayout">
          {paginatedProducts.length > 0 ? (
            <motion.div 
              layout
              key={`grid-page-${currentPage}`}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {paginatedProducts.map((product, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.94, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -15 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.04, 0.4) }}
                  key={product.id || product.name || `prod-${idx}`}
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
                    <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
                      <div className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full font-secondary text-[10px] font-bold tracking-widest uppercase text-secondary">
                        {product.category}
                      </div>
                      {product.outOfStock && (
                        <div className="px-3 py-1 bg-amber-600/90 text-white backdrop-blur-md rounded-full font-secondary text-[10px] font-bold tracking-widest uppercase border border-amber-500/30 shadow-md">
                          Made To Order
                        </div>
                      )}
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
                      {product.outOfStock ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                          className="text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-1 font-secondary text-[11px] uppercase tracking-wider font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20"
                        >
                          <PiHammerLight size={15} />
                          <span>Order</span>
                        </button>
                      ) : (
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
                      )}
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

        {/* ── Luxury Pagination Control Bar ── */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-14 pt-8 border-t border-secondary/10 flex flex-col items-center gap-6"
          >
            {/* Page Progress Indicator Bar */}
            <div className="w-full max-w-xs flex flex-col items-center gap-2">
              <div className="w-full h-1 bg-secondary/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-gold-light via-gold to-gold-dark rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentPage / totalPages) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.22em] text-secondary/40">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            {/* Pagination Controls Row */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous Page"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-secondary/15 bg-white text-secondary font-secondary text-[11px] font-bold uppercase tracking-widest hover:border-gold hover:text-gold hover:shadow-md transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none disabled:hover:border-secondary/15 disabled:hover:text-secondary group"
              >
                <PiCaretLeftLight size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-secondary/10 shadow-sm">
                {getPageNumbers(currentPage, totalPages).map((page, idx) => {
                  if (page === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 font-secondary text-[12px] text-secondary/30 select-none">
                        •••
                      </span>
                    );
                  }

                  const isActive = page === currentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-full font-secondary text-[12px] font-bold transition-all duration-300 flex items-center justify-center ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20 ring-2 ring-gold/40 scale-105"
                          : "text-secondary/70 hover:text-gold hover:bg-gold/10"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-secondary/15 bg-white text-secondary font-secondary text-[11px] font-bold uppercase tracking-widest hover:border-gold hover:text-gold hover:shadow-md transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none disabled:hover:border-secondary/15 disabled:hover:text-secondary group"
              >
                <span className="hidden sm:inline">Next</span>
                <PiCaretRightLight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>

            </div>
          </motion.div>
        )}

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
