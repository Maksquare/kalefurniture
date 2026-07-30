"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { PiArrowLeftLight, PiArrowRightLight } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    title: "The Grand Entrance",
    description: "Step into a world of curated elegance.",
    imgUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: 2,
    title: "Living & Lounge",
    description: "Experience comfort redefined in our spacious lounge setups.",
    imgUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: 3,
    title: "Dining Collections",
    description: "Where every meal becomes a celebration.",
    imgUrl: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: 4,
    title: "Bedroom Sanctuaries",
    description: "Discover the ultimate retreat for rest and relaxation.",
    imgUrl: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: 5,
    title: "Lighting & Accents",
    description: "The finishing touches that complete your space.",
    imgUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=2000",
  }
];

const ShowroomSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center", skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxImg(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full py-12 md:py-20 overflow-hidden">
      
      {/* Embla Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y" style={{ marginLeft: "calc(var(--slide-spacing) * -1)" }}>
          {slides.map((slide, index) => {
            const isActive = index === selectedIndex;
            return (
              <div 
                className="flex-[0_0_85%] md:flex-[0_0_70%] lg:flex-[0_0_55%] min-w-0 px-2 md:px-4" 
                key={slide.id}
              >
                <div 
                  className={`relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-2xl md:rounded-[2rem] group ${isActive ? "cursor-zoom-in" : ""}`}
                  onClick={() => isActive && setLightboxImg(slide.imgUrl)}
                >
                  {/* Image */}
                  <img
                    src={slide.imgUrl}
                    alt={slide.title}
                    className={`w-full h-full object-cover transition-all duration-1000 ${
                      isActive ? "scale-100 opacity-100" : "scale-110 opacity-40 blur-[2px]"
                    }`}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-700 ${isActive ? "opacity-100" : "opacity-0"}`} />

                  {/* Content */}
                  <div className={`absolute bottom-0 left-0 p-6 md:p-12 transition-all duration-700 transform ${isActive ? "translate-y-0 opacity-100 delay-300" : "translate-y-10 opacity-0"}`}>
                    <h3 className="font-primary text-[28px] md:text-[42px] text-white leading-tight mb-2 md:mb-4">
                      {slide.title}
                    </h3>
                    <p className="font-secondary text-[14px] md:text-[16px] text-white/70 max-w-md leading-relaxed">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation & Progress */}
      <div className="container mt-12 md:mt-16 flex items-center justify-between">
        {/* Progress Bar */}
        <div className="flex items-center gap-4">
          <span className="font-secondary text-[12px] font-medium tracking-[0.2em] text-secondary/60 w-8 text-right">
            0{selectedIndex + 1}
          </span>
          <div className="w-32 md:w-64 h-[2px] bg-secondary/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gold"
              initial={{ width: 0 }}
              animate={{ width: `${((selectedIndex + 1) / slides.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <span className="font-secondary text-[12px] font-medium tracking-[0.2em] text-secondary/60 w-8">
            0{slides.length}
          </span>
        </div>
      </div>

      {/* Arrows (Positioned on sides) */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-10">
        <button
          onClick={scrollPrev}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-secondary/20 bg-surface/50 backdrop-blur-md flex items-center justify-center hover:bg-gold hover:border-gold hover:text-primary transition-all duration-300 text-secondary group pointer-events-auto ml-2 md:ml-8 shadow-lg"
          aria-label="Previous slide"
        >
          <PiArrowLeftLight className="text-xl md:text-2xl transition-transform group-hover:-translate-x-1" />
        </button>
        <button
          onClick={scrollNext}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-secondary/20 bg-surface/50 backdrop-blur-md flex items-center justify-center hover:bg-gold hover:border-gold hover:text-primary transition-all duration-300 text-secondary group pointer-events-auto mr-2 md:mr-8 shadow-lg"
          aria-label="Next slide"
        >
          <PiArrowRightLight className="text-xl md:text-2xl transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-primary/95 backdrop-blur-md p-4 md:p-8 cursor-zoom-out"
            onClick={() => setLightboxImg(null)}
          >
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              src={lightboxImg}
              alt="Fullscreen view"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-gold hover:text-primary transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShowroomSlider;
