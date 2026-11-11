"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  PiSparkleFill, 
  PiCaretLeftBold, 
  PiCaretRightBold,
  PiEyeLight
} from "react-icons/pi";
import ProductModal from "./ProductModal";
import { formatPrice } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/imageUtils";
import { useSiteSettings, defaultFeaturedCards, defaultHeroSettings } from "@/context/SiteSettingsContext";
import { useProducts } from "@/context/ProductContext";
import { allProducts } from "@/lib/data";

// ── Curated Real Products for the Hero Arc Carousel (Actual Catalog Pieces) ──
const DEFAULT_CAROUSEL_ITEMS = [
  {
    id: "prod-1790066843790",
    name: "KSF-009",
    category: "Living Room",
    price: 80000,
    badge: "SIGNATURE ATELIER",
    image: "/ksf009-preview.webp",
    description: "Signature living room suite crafted with tailored fluted upholstery and handcrafted gold stiletto legs.",
    finish: "Textured Cream Upholstery & Solid Brass Accents",
    structure: "Reinforced Kiln-Dried Hardwood Frame",
    warranty: "15-Year Atelier Structural Guarantee",
    images: ["/ksf009-preview.webp"],
  },
  {
    id: "prod-1791344734296-nwao",
    name: "KDT-003",
    category: "Dining Area",
    price: 75000,
    badge: "FEATURED",
    image: "https://kalefurnitures.com/uploads/1791344716_95df2ad4_Elegant_Gold_Dining_Set_on_Mar.png",
    description: "Curated dining suite with solid hardwood core, bespoke gold trims, and tailored finishes.",
    finish: "Polished Marble & Brass Accents",
    structure: "Reinforced Frame & Solid Brass Accents",
    warranty: "10-Year Master Structural Guarantee",
    images: ["https://kalefurnitures.com/uploads/1791344716_95df2ad4_Elegant_Gold_Dining_Set_on_Mar.png"],
  },
  {
    id: "prod-1791344734351-n5f6",
    name: "KSF-014",
    category: "Living Room",
    price: 80000,
    badge: "BESTSELLER",
    image: "https://kalefurnitures.com/uploads/1791344717_402f976f_Luxurious_Teal_Sofa_Set_with_M.png",
    description: "Luxurious sofa set with tailored aesthetics and enduring ergonomics.",
    finish: "High-Resilience Tailored Weave",
    structure: "Kiln-Dried Solid Hardwood Frame",
    warranty: "10-Year Master Structural Guarantee",
    images: ["https://kalefurnitures.com/uploads/1791344717_402f976f_Luxurious_Teal_Sofa_Set_with_M.png"],
  },
  {
    id: "prod-1791316754372",
    name: "KDB-005",
    category: "Bedroom",
    price: 35000,
    badge: "NEW ARRIVAL",
    image: "https://kalefurnitures.com/uploads/1791316789_d6eb030d_KBD005_Geometric_Upholstered_B.png",
    description: "Architectural geometric upholstered bed with reinforced hardwood frame.",
    finish: "Tailored Linen Weave",
    structure: "Solid Kiln-Dried Hardwood",
    warranty: "10-Year Master Structural Guarantee",
    images: ["https://kalefurnitures.com/uploads/1791316789_d6eb030d_KBD005_Geometric_Upholstered_B.png"],
  },
  {
    id: "prod-1791344734236-x41p",
    name: "KDT-004",
    category: "Dining Area",
    price: 75000,
    badge: "FEATURED",
    image: "https://kalefurnitures.com/uploads/1791344715_c6ee4105_KDT004_Luxury_Dining_Set.png",
    description: "Sculptural luxury dining ensemble designed for everyday elegance and gatherings.",
    finish: "Polished Stone & Hardwood",
    structure: "Solid Frame with Brass Accents",
    warranty: "10-Year Master Structural Guarantee",
    images: ["https://kalefurnitures.com/uploads/1791344715_c6ee4105_KDT004_Luxury_Dining_Set.png"],
  },
  {
    id: "prod-1791316548196",
    name: "KCL-004",
    category: "Bedroom",
    price: 40000,
    badge: "SIGNATURE",
    image: "https://kalefurnitures.com/uploads/1791316645_de920bee_Modern_Wardrobe_in_Warm_Beige_.png",
    description: "Modern bespoke wardrobe with tailored storage compartments and soft-close hardware.",
    finish: "Warm Beige Lacquer & Solid Oak",
    structure: "Reinforced Hardwood Structure",
    warranty: "10-Year Master Structural Guarantee",
    images: ["https://kalefurnitures.com/uploads/1791316645_de920bee_Modern_Wardrobe_in_Warm_Beige_.png"],
  },
  {
    id: "prod-1785413082158",
    name: "KDT-001",
    category: "Dining Area",
    price: 90000,
    badge: "FEATURED",
    image: "https://kalefurnitures.com/uploads/1791344714_059a8387_Luxury_Marble_Dining_Set.png",
    description: "Modern dining collection crafted with meticulous detail and timeless materials.",
    finish: "Marble & Gold Electroplated Steel",
    structure: "Reinforced Metal & Hardwood Frame",
    warranty: "10-Year Master Structural Guarantee",
    images: ["https://kalefurnitures.com/uploads/1791344714_059a8387_Luxury_Marble_Dining_Set.png"],
  },
  {
    id: "prod-1791362767210-lih0",
    name: "KBD-001",
    category: "Bedroom",
    price: 35000,
    badge: "NEW ARRIVAL",
    image: "https://kalefurnitures.com/uploads/1791362401_9c017bf6_KBD_001.png",
    description: "Contemporary bedroom centerpiece engineered for restful sleep and sculptural poise.",
    finish: "Textured Velvet Upholstery",
    structure: "Reinforced Kiln-Dried Hardwood",
    warranty: "10-Year Master Structural Guarantee",
    images: ["https://kalefurnitures.com/uploads/1791362401_9c017bf6_KBD_001.png"],
  },
];

export default function Hero({ initialProduct, initialHeroSettings }) {
  const { heroSettings: contextHeroSettings } = useSiteSettings?.() || {};
  const heroSettings =
    (contextHeroSettings !== null && contextHeroSettings !== undefined
      ? contextHeroSettings
      : initialHeroSettings) || defaultHeroSettings;
  const { products } = useProducts?.() || {};

  const [activeIndex, setActiveIndex] = useState(0);
  const [modalProduct, setModalProduct] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  // ── Hero Main Image Loading State & Cache Detection ──
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  const mainImgRef = useRef(null);

  // Detect cached images or asynchronous browser decode
  useEffect(() => {
    const img = mainImgRef.current;
    if (!img) return;

    // Fast-path: image already completed in browser memory/disk cache
    if (img.complete && img.naturalWidth > 0) {
      setMainImageLoaded(true);
      return;
    }

    // Modern asynchronous decode check for jank-free first paint
    if (typeof img.decode === "function") {
      img
        .decode()
        .then(() => setMainImageLoaded(true))
        .catch(() => {
          // If decode fails or gets interrupted, standard onLoad/onError will handle it
        });
    }
  }, []);

  // Responsive window listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // ── Compile Hero Arc Carousel strictly from ACTUAL Catalog Products ──
  const carouselItems = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    // 1. Gather actual products from live catalog or real catalog defaults
    const catalogSource = (products && products.length > 0) ? products : DEFAULT_CAROUSEL_ITEMS;
    
    if (Array.isArray(catalogSource)) {
      // Pass 1: Featured, New Arrival, or Bestseller catalog items
      catalogSource.forEach((p) => {
        const isHighlight = p.featured || p.isNew || p.badge || p.bestSeller;
        const img = p.images?.[0] || p.image;
        if (isHighlight && img && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          list.push({
            id: p.id,
            name: p.name,
            category: p.category || "Living Room",
            price: p.price,
            badge: p.badge || (p.isNew ? "NEW ARRIVAL" : p.featured ? "FEATURED" : "BESTSELLER"),
            image: img,
            description: p.description || "",
            dimensions: p.dimensions || "",
            finish: p.finish || "",
            structure: p.structure || "",
            warranty: p.warranty || "10-Year Master Structural Guarantee",
            images: p.images || [img],
            allowcustomcolor: p.allowcustomcolor,
            colors: p.colors,
            swatches: p.swatches,
          });
        }
      });

      // Pass 2: Remaining actual catalog products up to 10
      catalogSource.forEach((p) => {
        const img = p.images?.[0] || p.image;
        if (img && !seenIds.has(p.id) && list.length < 10) {
          seenIds.add(p.id);
          list.push({
            id: p.id,
            name: p.name,
            category: p.category || "Living Room",
            price: p.price,
            badge: p.badge || (p.isNew ? "NEW ARRIVAL" : p.featured ? "FEATURED" : "SIGNATURE"),
            image: img,
            description: p.description || "",
            dimensions: p.dimensions || "",
            finish: p.finish || "",
            structure: p.structure || "",
            warranty: p.warranty || "10-Year Master Structural Guarantee",
            images: p.images || [img],
            allowcustomcolor: p.allowcustomcolor,
            colors: p.colors,
            swatches: p.swatches,
          });
        }
      });
    }

    // Pass 3: Fallback safety only from real catalog defaults
    if (list.length < 5) {
      DEFAULT_CAROUSEL_ITEMS.forEach((d) => {
        if (!seenIds.has(d.id) && list.length < 10) {
          seenIds.add(d.id);
          list.push(d);
        }
      });
    }

    return list.slice(0, 10);
  }, [products]);

  const totalItems = carouselItems.length;

  // ── Navigation Handlers ──
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalItems);
  }, [totalItems]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
  }, [totalItems]);

  // Auto-play interval with pause on hover
  useEffect(() => {
    if (isHovered || totalItems <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4200);
    return () => clearInterval(timer);
  }, [isHovered, totalItems, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  // Drag handler for touch & mouse swiping
  const handleDragEnd = (_, info) => {
    const threshold = 35;
    if (info.offset.x < -threshold) {
      handleNext();
    } else if (info.offset.x > threshold) {
      handlePrev();
    }
  };

  // ── 3D Arc Geometry Calculation (Matching Reference Image) ──
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const getCardTransform = (diff) => {
    const xStep = isMobile ? 105 : isTablet ? 165 : 215;
    const yStep = isMobile ? 20 : 32;
    const rotStep = isMobile ? 7.5 : 8.5;

    if (diff === 0) {
      return {
        x: 0,
        y: 0,
        rotate: 0,
        scale: isMobile ? 1.06 : 1.1,
        zIndex: 30,
        opacity: 1,
        filter: "brightness(1)",
        pointerEvents: "auto",
      };
    }
    if (diff === -1) {
      return {
        x: -xStep,
        y: yStep,
        rotate: -rotStep,
        scale: isMobile ? 0.88 : 0.92,
        zIndex: 20,
        opacity: 0.95,
        filter: "brightness(0.92)",
        pointerEvents: "auto",
      };
    }
    if (diff === 1) {
      return {
        x: xStep,
        y: yStep,
        rotate: rotStep,
        scale: isMobile ? 0.88 : 0.92,
        zIndex: 20,
        opacity: 0.95,
        filter: "brightness(0.92)",
        pointerEvents: "auto",
      };
    }
    if (diff === -2) {
      return {
        x: -xStep * 1.85,
        y: yStep * 2.4,
        rotate: -rotStep * 1.9,
        scale: isMobile ? 0.72 : 0.78,
        zIndex: 10,
        opacity: isMobile ? 0.45 : 0.65,
        filter: "brightness(0.75)",
        pointerEvents: "auto",
      };
    }
    if (diff === 2) {
      return {
        x: xStep * 1.85,
        y: yStep * 2.4,
        rotate: rotStep * 1.9,
        scale: isMobile ? 0.72 : 0.78,
        zIndex: 10,
        opacity: isMobile ? 0.45 : 0.65,
        filter: "brightness(0.75)",
        pointerEvents: "auto",
      };
    }
    // Cards beyond the 5 visible arc items
    return {
      x: diff < 0 ? -xStep * 2.4 : xStep * 2.4,
      y: yStep * 3.2,
      rotate: diff < 0 ? -rotStep * 2.5 : rotStep * 2.5,
      scale: 0.55,
      zIndex: 0,
      opacity: 0,
      filter: "brightness(0.5)",
      pointerEvents: "none",
    };
  };

  const activeProduct = carouselItems[activeIndex] || carouselItems[0];

  return (
    <div className="w-full">
      {/* ─────────────────────────────────────────────────────────────
          HERO STAGE: 3D ARC CAROUSEL (Matching User Reference Image)
          Deep Midnight Navy / Charcoal background strictly within brand
      ───────────────────────────────────────────────────────────── */}
      <section 
        data-header-theme="dark"
        aria-busy={!mainImageLoaded}
        className="relative w-full min-h-[94svh] lg:min-h-[100svh] flex flex-col justify-between overflow-hidden pt-28 sm:pt-32 pb-12 sm:pb-16 select-none bg-[#050C14]"
        style={{
          background: "radial-gradient(ellipse at 50% 36%, #0A1C2C 0%, #061320 48%, #03080E 100%)"
        }}
      >
        {/* Atelier Gold Radial Ambient Core Glow (Clean ambience without unlinked watermark image) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <div className="w-[440px] sm:w-[580px] h-[340px] rounded-full bg-gold/10 blur-[130px] pointer-events-none -translate-y-6" />
        </div>

        {/* Ambient Top Vignette for Crystal Clear Navbar contrast */}
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-black/45 via-black/20 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center flex-1 justify-between">
          
          {/* ── 1. Top Brand Mark Icon (Matching Reference Image Header Mark) ── */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center pt-2 sm:pt-4"
          >
            <div className="flex items-center justify-center transition-transform duration-300 hover:scale-110 cursor-pointer">
              {/* Minimalist Bauhaus / Mid-century Armchair Line-Art Icon */}
              <svg 
                width="34" 
                height="26" 
                viewBox="0 0 34 26" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="text-white/85 drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]"
              >
                <path 
                  d="M5 9C5 5.7 7.5 3 11 3H23C26.5 3 29 5.7 29 9V17H5V9Z" 
                  stroke="currentColor" 
                  strokeWidth="1.6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M8 17V22M26 17V22" 
                  stroke="currentColor" 
                  strokeWidth="1.6" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M8 11C8 8.5 9.8 7 12 7H22C24.2 7 26 8.5 26 11V14H8V11Z" 
                  stroke="#D9B66E" 
                  strokeWidth="1.4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <circle cx="17" cy="17" r="1.5" fill="#D9B66E" />
              </svg>
            </div>
          </motion.div>

          {/* ── 2. The 3D Curved Arc Carousel Stage ── */}
          <div 
            className="relative w-full max-w-5xl mx-auto flex items-center justify-center my-auto py-4 sm:py-6"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
          >
            {/* Carousel Canvas */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="relative w-full h-[260px] sm:h-[340px] md:h-[390px] lg:h-[420px] flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              {carouselItems.map((item, idx) => {
                // Shortest circular distance from activeIndex to idx
                let diff = (idx - activeIndex) % totalItems;
                if (diff > totalItems / 2) diff -= totalItems;
                if (diff < -totalItems / 2) diff += totalItems;

                const config = getCardTransform(diff);
                const isActive = diff === 0;

                // Defer and hide secondary cards until the main hero image finishes loading
                const cardOpacity = (!mainImageLoaded && !isActive) ? 0 : config.opacity;

                return (
                  <motion.div
                    key={item.id || idx}
                    animate={{
                      x: config.x,
                      y: config.y,
                      rotate: config.rotate,
                      scale: config.scale,
                      opacity: cardOpacity,
                      filter: config.filter,
                      zIndex: config.zIndex,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 240,
                      damping: 26,
                      mass: 0.8,
                    }}
                    style={{ pointerEvents: config.pointerEvents }}
                    onClick={() => {
                      if (!isActive) {
                        setActiveIndex(idx);
                      } else {
                        setModalProduct(item);
                      }
                    }}
                    className={`absolute w-[185px] h-[185px] sm:w-[250px] sm:h-[250px] md:w-[285px] md:h-[285px] lg:w-[310px] lg:h-[310px] rounded-[26px] sm:rounded-[34px] overflow-hidden border transition-shadow duration-500 group select-none ${
                      isActive 
                        ? "border-white/40 ring-1 ring-gold/40 shadow-[0_25px_60px_rgba(0,0,0,0.85)] cursor-pointer" 
                        : "border-white/15 hover:border-white/35 shadow-[0_15px_35px_rgba(0,0,0,0.5)] cursor-pointer"
                    }`}
                  >
                    {/* Atelier Theme Shimmer Placeholder (Matches exact card dimensions, radius, and palette) */}
                    {!mainImageLoaded && isActive && (
                      <div 
                        className="absolute inset-0 z-0 bg-gradient-to-br from-[#0A1C2C] via-[#061320] to-[#03080E] flex items-center justify-center overflow-hidden pointer-events-none"
                        aria-hidden="true"
                      >
                        {/* Subtle atelier gold shimmer sweep */}
                        <div 
                          className="absolute inset-0 animate-[shimmer_2.2s_infinite] motion-reduce:animate-none"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(221, 182, 125, 0.16) 50%, transparent 100%)',
                            backgroundSize: '200% 100%',
                          }}
                        />
                        {/* Armchair Brand Icon Mark in Center of Placeholder */}
                        <div className="opacity-20 flex flex-col items-center">
                          <svg 
                            width="34" 
                            height="26" 
                            viewBox="0 0 34 26" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="text-gold"
                          >
                            <path 
                              d="M5 9C5 5.7 7.5 3 11 3H23C26.5 3 29 5.7 29 9V17H5V9Z" 
                              stroke="currentColor" 
                              strokeWidth="1.6" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                            />
                            <path 
                              d="M8 17V22M26 17V22" 
                              stroke="currentColor" 
                              strokeWidth="1.6" 
                              strokeLinecap="round" 
                            />
                            <path 
                              d="M8 11C8 8.5 9.8 7 12 7H22C24.2 7 26 8.5 26 11V14H8V11Z" 
                              stroke="currentColor" 
                              strokeWidth="1.4" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                            />
                            <circle cx="17" cy="17" r="1.5" fill="currentColor" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Product Image with High-Priority / Eager on Active, Lazy on Secondary */}
                    <img
                      ref={isActive ? mainImgRef : undefined}
                      src={mainImageError && isActive ? "/assets/img/hero/beige-chair.jpeg" : resolveImageUrl(item.image)}
                      alt={item.name || "Kal Furniture Heirloom"}
                      fetchPriority={isActive ? "high" : "low"}
                      loading={isActive ? "eager" : "lazy"}
                      decoding={isActive ? "sync" : "async"}
                      onLoad={() => {
                        if (isActive) setMainImageLoaded(true);
                      }}
                      onError={() => {
                        if (isActive) {
                          setMainImageError(true);
                          setMainImageLoaded(true);
                        }
                      }}
                      className={`w-full h-full object-cover object-center transition-all duration-500 ease-out motion-reduce:transition-none group-hover:scale-105 pointer-events-none ${
                        isActive
                          ? mainImageLoaded ? "opacity-100" : "opacity-0"
                          : "opacity-100"
                      }`}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Top Status Badge */}
                    {item.badge && (
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-secondary text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider shadow-sm">
                          {isActive ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                          )}
                          {item.badge}
                        </span>
                      </div>
                    )}

                    {/* Active Card Bottom Quick-Inspect Bar */}
                    {isActive && (
                      <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between p-2 sm:p-2.5 rounded-2xl bg-black/55 backdrop-blur-md border border-white/15 text-white transition-opacity duration-300">
                        <div className="min-w-0 pr-2">
                          <p className="font-secondary text-[11px] sm:text-[12px] font-bold uppercase tracking-wider truncate">
                            {item.name}
                          </p>
                          <p className="font-secondary text-[10px] sm:text-[11px] text-gold font-medium font-ethiopic">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="w-7 h-7 rounded-xl bg-white/15 hover:bg-gold hover:text-black flex items-center justify-center shrink-0 transition-colors">
                          <PiEyeLight size={15} />
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Subtle Navigation Caret Controls */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous card"
              className="hidden md:flex absolute left-2 lg:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/15 text-white/70 hover:text-white items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 z-40 cursor-pointer shadow-lg"
            >
              <PiCaretLeftBold size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next card"
              className="hidden md:flex absolute right-2 lg:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/15 text-white/70 hover:text-white items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 z-40 cursor-pointer shadow-lg"
            >
              <PiCaretRightBold size={16} />
            </button>
          </div>

          {/* ── 3. Headline & Pill Button (Matching User Reference Image) ── */}
          <div className="flex flex-col items-center text-center pb-2 sm:pb-4">
            
            {/* Elegant Headline (Matching "Eyewear That Stands Out") */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mb-6 sm:mb-8"
            >
              <h1 className="font-secondary text-[32px] sm:text-[44px] md:text-[52px] lg:text-[58px] font-light text-white tracking-[-0.015em] leading-[1.05] drop-shadow-sm">
                Furniture That Stands Out
              </h1>
              <p className="font-secondary text-[11px] sm:text-[12px] uppercase tracking-[0.25em] text-white/45 mt-2">
                Handcrafted in Addis Ababa • Atelier Heirlooms
              </p>
            </motion.div>

            {/* Pill Button: Enter Store → (Exact 1:1 Match with Reference Button) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28 }}
              className="flex items-center justify-center"
            >
              <Link
                href="/collections"
                className="inline-flex items-center gap-3.5 bg-white hover:bg-white/95 text-[#0A1118] pl-7 pr-2.5 py-2.5 sm:pl-8 sm:pr-3 sm:py-3 rounded-full font-secondary text-[12.5px] sm:text-[13px] font-bold tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_12px_40px_rgba(0,0,0,0.55)] group cursor-pointer"
              >
                <span className="font-medium">Enter Store</span>
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 7H11.5M11.5 7L7 2.5M11.5 7L7 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </Link>
            </motion.div>

            {/* Subtle Progress Dot Indicators */}
            <div className="flex items-center gap-1.5 mt-5">
              {carouselItems.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setActiveIndex(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                    dotIdx === activeIndex 
                      ? "w-6 bg-gold shadow-[0_0_8px_rgba(217,182,110,0.6)]" 
                      : "w-1.5 bg-white/20 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FULL PRODUCT MODAL (Inspect & Add to Cart on Active Card Click)
      ───────────────────────────────────────────────────────────── */}
      {modalProduct && (
        <ProductModal
          isOpen={Boolean(modalProduct)}
          onClose={() => setModalProduct(null)}
          product={modalProduct}
        />
      )}
    </div>
  );
}