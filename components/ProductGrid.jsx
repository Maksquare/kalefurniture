"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { PiShoppingCartLight, PiStarFill, PiStarLight, PiArrowLeftLight, PiArrowRightLight } from "react-icons/pi";
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import ProductModal from "./ProductModal";
import useEmblaCarousel from "embla-carousel-react";

const ProductGrid = ({ title = "Trending Finds", subtitle = "Handpicked furniture pieces everyone loves right now." }) => {
  const { products, isLoaded } = useProducts();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps"
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  // Get products to display
  const trendingProducts = isLoaded ? products : [];

  return (
    <section className="py-20 bg-surface overflow-hidden">
      <div className="container">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h2 className="font-primary text-[36px] font-semibold text-secondary mb-2">
              {title}
            </h2>
            <p className="font-secondary text-[14px] text-secondary/70 max-w-md">
              {subtitle}
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-3">
            <button 
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className={`w-12 h-12 rounded-full border border-secondary/10 flex items-center justify-center transition-all duration-300 ${
                prevBtnEnabled ? "text-secondary hover:bg-gold hover:text-white hover:border-gold hover:shadow-lg" : "text-secondary/20 cursor-not-allowed"
              }`}
              aria-label="Previous"
            >
              <PiArrowLeftLight size={20} />
            </button>
            <button 
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className={`w-12 h-12 rounded-full border border-secondary/10 flex items-center justify-center transition-all duration-300 ${
                nextBtnEnabled ? "text-secondary hover:bg-gold hover:text-white hover:border-gold hover:shadow-lg" : "text-secondary/20 cursor-not-allowed"
              }`}
              aria-label="Next"
            >
              <PiArrowRightLight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel Viewport */}
        <div className="overflow-visible" ref={emblaRef}>
          <div className="flex gap-6 pb-8 touch-pan-y">
            {trendingProducts.map((product, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.5 }}
                key={product.id}
                className="group flex-[0_0_240px] md:flex-[0_0_280px] min-w-0 bg-white rounded-2xl overflow-hidden border border-secondary/5 hover:shadow-xl transition-shadow duration-300 relative flex flex-col"
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
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress Bar Pagination */}
        {scrollSnaps.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="font-secondary text-[12px] font-medium tracking-[0.2em] text-secondary/60 w-8 text-right">
              {String(selectedIndex + 1).padStart(2, '0')}
            </span>
            <div className="w-32 md:w-64 h-[2px] bg-secondary/10 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute top-0 left-0 bottom-0 bg-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((selectedIndex + 1) / scrollSnaps.length) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <span className="font-secondary text-[12px] font-medium tracking-[0.2em] text-secondary/60 w-8">
              {String(scrollSnaps.length).padStart(2, '0')}
            </span>
          </div>
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

export default ProductGrid;
