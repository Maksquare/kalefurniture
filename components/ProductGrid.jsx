"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { PiShoppingCartLight, PiStarFill, PiStarLight, PiArrowLeftLight, PiArrowRightLight, PiHammerLight } from "react-icons/pi";
import { useProducts } from "@/context/ProductContext";
import { useCart } from "@/context/CartContext";
import ProductModal from "./ProductModal";
import useEmblaCarousel from "embla-carousel-react";
import { resolveImageUrl } from "@/lib/imageUtils";
import { allProducts as fallbackProducts } from "@/lib/data";

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

  // Get products to display (use fallback while loading so section is never blank)
  const trendingProducts = products?.length > 0 ? products : (isLoaded ? [] : fallbackProducts);

  return (
    <section className="py-24 bg-surface overflow-hidden">
      <div className="container">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.25em] text-gold-dark">
                Curated Highlights
              </span>
            </div>
            <h2 className="font-primary text-[36px] sm:text-[44px] font-semibold text-secondary leading-tight mb-2">
              {title}
            </h2>
            <p className="font-secondary text-[15px] text-secondary/70 max-w-md font-light">
              {subtitle}
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-3">
            <button 
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className={`w-12 h-12 rounded-full border border-secondary/15 flex items-center justify-center transition-all duration-300 ${
                prevBtnEnabled 
                  ? "text-secondary hover:bg-gold hover:text-white hover:border-gold hover:shadow-[0_4px_16px_rgba(217,182,110,0.3)] active:scale-95" 
                  : "text-secondary/20 cursor-not-allowed border-secondary/5"
              }`}
              aria-label="Previous"
            >
              <PiArrowLeftLight size={20} />
            </button>
            <button 
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className={`w-12 h-12 rounded-full border border-secondary/15 flex items-center justify-center transition-all duration-300 ${
                nextBtnEnabled 
                  ? "text-secondary hover:bg-gold hover:text-white hover:border-gold hover:shadow-[0_4px_16px_rgba(217,182,110,0.3)] active:scale-95" 
                  : "text-secondary/20 cursor-not-allowed border-secondary/5"
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
                className="group flex-[0_0_260px] md:flex-[0_0_300px] min-w-0 bg-white rounded-3xl overflow-hidden border border-secondary/10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(6,35,53,0.09)] transition-all duration-500 hover:-translate-y-1.5 relative flex flex-col"
              >
                {/* Image Area */}
                <div 
                  className="relative w-full aspect-square bg-[#F6F3EC] flex items-center justify-center cursor-pointer overflow-hidden"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img 
                    src={resolveImageUrl(product.images?.[0])} 
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Out of stock / Made to Order badge */}
                  {product.outOfStock ? (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-amber-600/90 text-white backdrop-blur-md rounded-full font-secondary text-[9px] font-bold tracking-[0.2em] uppercase border border-amber-400/30 shadow-sm">
                      Made To Order
                    </div>
                  ) : product.featured && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-primary/90 text-white backdrop-blur-md rounded-full font-secondary text-[9px] font-bold tracking-[0.2em] uppercase border border-white/20 shadow-sm">
                      Signature
                    </div>
                  )}

                  {/* Hover Quick-View Pill */}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <span className="px-4 py-2 rounded-full bg-white/95 backdrop-blur-md text-primary font-secondary text-[12px] font-semibold shadow-lg border border-secondary/10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      Quick Look
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 border-t border-secondary/10 flex-1 flex flex-col justify-between bg-white z-10">
                  <div>
                    {product.category && (
                      <span className="font-secondary text-[10px] font-bold uppercase tracking-[0.18em] text-secondary/50 block mb-1">
                        {product.category}
                      </span>
                    )}
                    <h3 
                      className="font-primary text-[18px] font-medium text-secondary truncate mb-1 cursor-pointer hover:text-gold transition-colors"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.name}
                    </h3>
                    
                    {/* Rating Stars */}
                    {product.sales_count >= 5 ? (
                      <div className="flex gap-1 text-gold mb-3">
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
                      <div className="mb-3 h-[10px]" />
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-secondary/5">
                    <span className="font-secondary text-[16px] font-bold text-primary flex items-baseline gap-1">
                      {product.price.toLocaleString()} <span className="font-ethiopic text-[12px] font-normal text-secondary/70">ብር</span>
                    </span>
                    {product.outOfStock ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        className="text-amber-800 hover:text-white hover:bg-amber-700 transition-all flex items-center gap-1 font-secondary text-[11px] uppercase tracking-wider font-bold bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 active:scale-95"
                      >
                        <PiHammerLight size={14} />
                        <span>Order</span>
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="text-secondary hover:text-white hover:bg-primary transition-all flex items-center gap-1.5 font-secondary text-[11px] uppercase tracking-wider font-semibold bg-secondary/5 px-3 py-1.5 rounded-full border border-secondary/10 active:scale-95 shadow-xs"
                      >
                        <PiShoppingCartLight size={15} />
                        <span>Add</span>
                      </button>
                    )}
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
