"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { PiArrowRightLight, PiArrowLeftLight, PiShoppingCartLight } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

import { usePackages } from "@/context/PackageContext";

// Inner component to manage the state of each package's active item
const PackageView = ({ pkg, isActive }) => {
  const { addToCart } = useCart();
  const [activeItemIdx, setActiveItemIdx] = useState(0);

  const activeItem = pkg.items[activeItemIdx];

  return (
    <div 
      className="w-full flex flex-col transition-opacity duration-700 bg-white"
      style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none' }}
    >
      {/* --- TOP SECTION (Hero) --- */}
      <div className="relative w-full min-h-[50vh] lg:min-h-[55vh] flex flex-col lg:flex-row overflow-hidden pb-8 lg:pb-0">

        {/* Left Text Content */}
        <div className="relative z-10 w-full lg:w-[45%] pl-6 pr-6 pt-12 lg:pl-16 lg:pt-20 flex flex-col">


          <h1 className="font-primary text-[50px] md:text-[64px] lg:text-[80px] font-normal leading-[1.05] tracking-tight text-secondary mb-2">
            {pkg.name.split(' ').slice(0, 2).join(' ')} <br/>
            {pkg.name.split(' ').slice(2).join(' ')}
          </h1>
          <h3 className="font-secondary text-[13px] tracking-[0.2em] uppercase text-secondary/50 font-bold mb-10">
            {pkg.collection}
          </h3>
          <p className="font-secondary text-[15px] leading-relaxed text-secondary/70 max-w-[320px]">
            {pkg.description}
          </p>


        </div>

        {/* Right Image Content */}
        <div className="relative z-10 w-full lg:w-[55%] flex items-end justify-center px-4 lg:px-0 h-[350px] lg:h-auto overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeItem.image}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
                transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                className="absolute bottom-0 w-full max-w-[800px] h-[300px] lg:h-[450px] flex items-end justify-center"
              >
                <img 
                  src={activeItem.image} 
                  alt={activeItem.name} 
                  className="w-full h-full object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] mix-blend-multiply"
                />
              </motion.div>
            </AnimatePresence>
        </div>


      </div>

      {/* --- BOTTOM SECTION (Specs & Details) --- */}
      <div className="w-full bg-[#EBE8DF] border-t border-secondary/20 pt-8 pb-12 relative z-20">
        <div className="container px-6 lg:px-16 flex flex-col lg:flex-row gap-12">
          
          {/* Left: Detail Images (Stacked Cards UI) */}
          <div className="w-full lg:w-[50%] flex flex-col items-center justify-start min-h-[350px] relative pb-8 lg:pb-0 pt-8 lg:pt-16">
            <div className="relative w-[220px] h-[260px] flex items-center justify-center">
              {pkg.items.map((item, i) => {
                const offset = i - activeItemIdx; // distance from active item
                
                const rotate = offset * 12; // degrees
                const x = offset * 45; // px
                const y = Math.abs(offset) * 8; // px (drops down slightly to enhance the arc)
                const scale = 1 - Math.abs(offset) * 0.05;
                const zIndex = 10 - Math.abs(offset);

                return (
                  <motion.div 
                    key={i} 
                    onClick={() => setActiveItemIdx(i)}
                    initial={false}
                    animate={{ 
                      rotate: rotate, 
                      x: x, 
                      y: y,
                      scale: scale, 
                      zIndex: zIndex 
                    }}
                    transition={{ type: "spring", stiffness: 150, damping: 22, mass: 0.8 }}
                    className="absolute w-[220px] h-[260px] bg-white rounded-3xl p-2 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-black/5 cursor-pointer hover:-translate-y-2 transition-transform duration-300"
                  >
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-black/5">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <p className="font-secondary text-[10px] text-secondary/40 mt-10 lg:mt-12 text-center uppercase tracking-[0.2em] z-20">
              Click cards to explore bundle
            </p>
          </div>

          {/* Right: Technical Specs */}
          <div className="w-full lg:w-[50%] flex flex-col gap-6 justify-center">
            <p className="font-secondary text-[10px] uppercase tracking-[0.2em] text-secondary/50 mb-2">
              Select an item to view details
            </p>
            {pkg.items.map((item, i) => (
              <div 
                key={i} 
                onClick={() => setActiveItemIdx(i)}
                className={`flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-secondary/10 pb-6 cursor-pointer transition-all duration-300 group ${activeItemIdx === i ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
              >
                {/* Text Specs */}
                <div className="w-full sm:w-1/2">
                  <h4 className={`font-secondary text-[14px] font-bold tracking-widest uppercase mb-4 border-b pb-2 inline-block transition-colors duration-500 ${activeItemIdx === i ? 'text-gold border-gold/30' : 'text-secondary border-secondary/20'}`}>
                    {item.name}
                  </h4>
                  <ul className="flex flex-col gap-1">
                    {Object.entries(item.specs).map(([key, value]) => (
                      <li key={key} className="font-secondary text-[12px] text-secondary/80 flex gap-2">
                        <span className="font-medium min-w-[70px]">{key}:</span> 
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>


              </div>
            ))}
          </div>
        </div>

        {/* Footer & Add to Cart */}
        <div className="container px-6 lg:px-16 mt-16 flex flex-col md:flex-row justify-between items-center border-t border-secondary/20 pt-6 gap-6 relative z-30">
          <div className="hidden md:block w-32"></div>
          
          <div className="flex flex-col items-center gap-4">
            <p className="font-secondary text-[12px] tracking-[0.2em] uppercase text-secondary font-bold">
              {pkg.collection} BY NATURE. TIMELESS BY DESIGN.
            </p>
            
            <button 
              onClick={() => addToCart({ id: pkg.id, name: pkg.name, price: pkg.price, images: [pkg.mainImage], quantity: 1 })}
              className="px-8 py-3 bg-secondary text-white font-secondary text-[11px] uppercase tracking-widest hover:bg-gold transition-colors flex items-center gap-2"
            >
              <PiShoppingCartLight size={16} />
              Add Complete Package - {pkg.price.toLocaleString('en-US')} ETB
            </button>
          </div>

          <div className="hidden md:block w-32"></div>
        </div>
      </div>

    </div>
  );
};

const PackageSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    watchDrag: false // Disable drag to prevent accidental swiping of this complex layout
  });
  
  const { packages, isLoaded } = usePackages();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full overflow-hidden" ref={emblaRef}>
      {isLoaded && packages.length === 0 ? (
        <div className="flex items-center justify-center min-h-[50vh] text-secondary/60">No packages found.</div>
      ) : (
      <>
        <div className="flex touch-pan-y">
          {packages.map((pkg, index) => {
          const isActive = index === selectedIndex;
          
          return (
            <div 
              key={pkg.id} 
              className="relative flex-[0_0_100%] min-w-0"
            >
              <PackageView pkg={pkg} isActive={isActive} />
            </div>
          );
        })}
      </div>

      {/* Global Slider Navigation (Floats over the slider) */}
      <div className="absolute top-[25vh] lg:top-[28vh] -translate-y-1/2 w-full flex justify-between px-4 lg:px-8 pointer-events-none z-50">
        <button 
          onClick={scrollPrev}
          className="w-14 h-14 rounded-full flex items-center justify-center text-secondary/40 hover:text-secondary hover:bg-secondary/5 transition-all duration-500 bg-transparent pointer-events-auto"
        >
          <PiArrowLeftLight size={28} />
        </button>
        <button 
          onClick={scrollNext}
          className="w-14 h-14 rounded-full flex items-center justify-center text-secondary/40 hover:text-secondary hover:bg-secondary/5 transition-all duration-500 bg-transparent pointer-events-auto"
        >
          <PiArrowRightLight size={28} />
        </button>
      </div>
      </>
      )}
    </div>
  );
};

export default PackageSlider;
