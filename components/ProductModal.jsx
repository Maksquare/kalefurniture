"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PiXLight, 
  PiCheckCircleFill, 
  PiShoppingCartSimpleBold, 
  PiShoppingCartSimpleLight,
  PiHammerBold, 
  PiPalette,
  PiChatCircleDotsLight,
  PiShieldCheckLight,
  PiSparkleLight,
  PiSparkleFill,
  PiRulerLight,
  PiCubeLight,
  PiMagnifyingGlassPlusLight
} from "react-icons/pi";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { usePackages } from "../context/PackageContext";
import MadeToOrderModal from "./MadeToOrderModal";
import { resolveImageUrl } from "@/lib/imageUtils";
import { formatPrice } from "@/lib/utils";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.25, ease: "easeIn" } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    y: 12, 
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } 
  },
};

const DEFAULT_SWATCHES = [
  { id: "cream", color: "#F2E3D5", label: "cream" },
  { id: "grand", color: "#836A58", label: "grand" },
  { id: "taupe", color: "#948473", label: "taupe" },
  { id: "mocha", color: "#A47F6A", label: "mocha" },
  { id: "noir",  color: "#1F1F21", label: "noir" }
];

const ProductModal = ({ isOpen, onClose, product }) => {
  const [activeProduct, setActiveProduct] = useState(product);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeSwatch, setActiveSwatch] = useState(null);
  const [customColor, setCustomColor] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isMadeToOrderOpen, setIsMadeToOrderOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [showSimilar, setShowSimilar] = useState(false);
  const imageContainerRef = useRef(null);
  const railRef = useRef(null);
  const { addToCart } = useCart();
  const { products } = useProducts();
  const packageContext = usePackages?.();
  const packages = packageContext?.packages || [];

  const scrollRail = (direction) => {
    if (railRef.current) {
      const amount = direction === "left" ? -220 : 220;
      railRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  // Sync activeProduct when prop changes
  useEffect(() => {
    setActiveProduct(product);
  }, [product]);

  const currentProd = activeProduct || product;

  // Normalize swatches from product
  const rawSwatches = currentProd?.swatches || currentProd?.colors;
  const hasSwatches = Array.isArray(rawSwatches) && rawSwatches.length > 0;
  
  // Read from exact Supabase column name 'allowcustomcolor' first
  const rawAllow = currentProd?.allowcustomcolor ?? currentProd?.allowCustomColor ?? currentProd?.allow_custom_color;
  const isColorChoiceAllowed = rawAllow === true || rawAllow === "true" || rawAllow === 1;
  const allowCustom = isColorChoiceAllowed;
  
  const swatches = isColorChoiceAllowed 
    ? (hasSwatches 
        ? rawSwatches.map((s, idx) => typeof s === "string" ? { id: `s-${idx}`, label: s, color: "#836A58" } : s)
        : (allowCustom ? DEFAULT_SWATCHES : []))
    : [];

  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      setIsAdded(false);
      setCustomColor("");
      setIsCustomMode(false);
      setIsZoomed(false);
      setShowSimilar(false);
      if (isColorChoiceAllowed && swatches.length > 0) {
        setActiveSwatch(swatches[0]);
      } else {
        setActiveSwatch(null);
      }
    }
  }, [isOpen, currentProd, isColorChoiceAllowed]);

  const getSelectedColorName = () => {
    if (!isColorChoiceAllowed) return null;
    if (isCustomMode && customColor.trim()) return customColor.trim();
    if (activeSwatch) return activeSwatch.label || activeSwatch.name || activeSwatch;
    return null;
  };

  const handleAddToCart = () => {
    if (isAdded) return;
    const colorToPass = getSelectedColorName();
    addToCart(currentProd, colorToPass);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  if (!currentProd) return null;

  const images = Array.isArray(currentProd.images) && currentProd.images.length > 0 
    ? currentProd.images 
    : [currentProd.image || "/placeholder.jpg"];
  const activeImageSrc = resolveImageUrl(images[activeImageIndex] || images[0]);

  // Specifications resolution: check if size (dimensions), finish, warranty were explicitly added
  const explicitDimensions = typeof currentProd.dimensions === "string" && currentProd.dimensions.trim() ? currentProd.dimensions.trim() : (typeof currentProd.size === "string" && currentProd.size.trim() ? currentProd.size.trim() : null);
  const explicitFinish = typeof currentProd.finish === "string" && currentProd.finish.trim() ? currentProd.finish.trim() : (typeof currentProd.material === "string" && currentProd.material.trim() ? currentProd.material.trim() : null);
  const explicitWarranty = typeof currentProd.warranty === "string" && currentProd.warranty.trim() ? currentProd.warranty.trim() : null;
  const explicitStructure = typeof currentProd.structure === "string" && currentProd.structure.trim() ? currentProd.structure.trim() : null;

  // Check if any key specs were missing
  const isMissingSpecs = !explicitDimensions || !explicitFinish || !explicitWarranty;

  const specsList = [
    {
      icon: PiCubeLight,
      label: "Structure",
      value: explicitStructure || "Kiln-Dried Solid Hardwood & High-Resilience Core"
    },
    {
      icon: PiRulerLight,
      label: "Dimensions",
      value: explicitDimensions || "Bespoke / Custom Living Proportions"
    },
    {
      icon: PiSparkleLight,
      label: "Finish",
      value: explicitFinish || "Curated Editorial Upholstery & Brass Accents"
    },
    {
      icon: PiShieldCheckLight,
      label: "Warranty",
      value: explicitWarranty || "10-Year Master Structural Guarantee"
    }
  ];

  // ── Explore Suite Pieces Rail (Image 3) ──
  const matchedPackage = (packages || []).find(pkg => 
    pkg.id === currentProd.packageId || 
    pkg.items?.some(it => it.id === currentProd.id || it.name?.toLowerCase() === currentProd.name?.toLowerCase())
  );

  let suitePieces = [];
  if (matchedPackage && Array.isArray(matchedPackage.items) && matchedPackage.items.length > 0) {
    suitePieces = matchedPackage.items.map((it, idx) => ({
      id: it.id || `pkg-item-${idx}`,
      name: it.name,
      pieceLabel: `PIECE ${String(idx + 1).padStart(2, "0")}`,
      image: resolveImageUrl(it.image),
      price: it.price || currentProd.price,
      description: it.description || currentProd.description,
      dimensions: it.specs?.Width ? `${it.specs.Width} × ${it.specs.Depth || ''} × ${it.specs.Height || ''}` : (it.dimensions || currentProd.dimensions),
      finish: it.specs?.Fabric || it.specs?.Material || it.finish || currentProd.finish,
      structure: it.specs?.Frame || it.specs?.Legs || it.structure || currentProd.structure,
      warranty: it.warranty || "10-Year Master Structural Guarantee",
      images: it.image ? [resolveImageUrl(it.image)] : (currentProd.images || []),
      category: currentProd.category || "Living Room",
    }));
  } else {
    // Curated suite ensemble from products of same category or harmonious collection
    const categoryMatches = (products || []).filter(p => !currentProd.category || p.category === currentProd.category);
    const pool = categoryMatches.length >= 3 ? categoryMatches : (products || []);
    const others = pool.filter(p => p.id !== currentProd.id).slice(0, 4);
    const combined = [currentProd, ...others];
    
    suitePieces = combined.map((p, idx) => {
      let cleanName = p.name?.replace(/The |Living Room |Collection |Piece /gi, '').trim() || `Piece 0${idx+1}`;
      if (cleanName.length > 18) cleanName = cleanName.slice(0, 16) + '...';
      return {
        id: p.id,
        name: cleanName,
        fullName: p.name,
        pieceLabel: `PIECE ${String(idx + 1).padStart(2, "0")}`,
        image: resolveImageUrl(p.images?.[0] || p.image),
        price: p.price,
        description: p.description,
        dimensions: p.dimensions,
        finish: p.finish,
        structure: p.structure,
        warranty: p.warranty,
        images: Array.isArray(p.images) && p.images.length ? p.images.map(resolveImageUrl) : [resolveImageUrl(p.image)],
        category: p.category,
        swatches: p.swatches,
        allowcustomcolor: p.allowcustomcolor,
      };
    });
  }

  const handleSelectSuitePiece = (piece) => {
    const fullProd = (products || []).find(p => p.id === piece.id || p.name === piece.fullName || p.name === piece.name) || piece;
    setActiveProduct(fullProd);
    setActiveImageIndex(0);
    setIsAdded(false);
  };

  const formattedPrice = (currentProd.price || 0).toLocaleString();
  const productName = (typeof currentProd.name === "string" && currentProd.name.trim()) || "Kal Furniture Piece";
  const whatsappUrl = `https://wa.me/251936358805?text=${encodeURIComponent(
    `Hello Kal Furniture showroom, I am interested in ${productName} (${formattedPrice} ብር). Could you please provide consultation regarding availability, custom dimensions, and fabric options?`
  )}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-primary/45 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl sm:rounded-[2.25rem] overflow-hidden shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] border border-white/40 flex flex-col"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-gold hover:text-white transition-all duration-300 shadow-md border border-secondary/10 group cursor-pointer"
              aria-label="Close modal"
            >
              <PiXLight className="text-secondary group-hover:text-white text-xl transition-colors" />
            </button>

            {/* Split Editorial Layout */}
            <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 custom-scrollbar">
              
              {/* ── LEFT COLUMN: Architectural Visual Stage (7 cols) ── */}
              <div className="lg:col-span-7 bg-[#F6F3EC] relative flex flex-col justify-between p-4 sm:p-8 overflow-hidden border-b lg:border-b-0 lg:border-r border-secondary/10 shrink-0">
                
                {/* Floating Category Pill */}
                <div className="relative z-10 flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-gold" />
                    <span className="font-secondary text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">
                      {product.category || "Living Room"}
                    </span>
                  </div>

                  {product.outOfStock ? (
                    <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-secondary text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      Made to Order
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-secondary uppercase tracking-[0.2em] text-secondary/50 font-medium">
                      <PiMagnifyingGlassPlusLight className="text-gold" /> Hover to Inspect
                    </span>
                  )}
                </div>

                {/* Main Image Stage (1:1 aspect with subtle zoom lens, object-contain ensures full furniture visibility) */}
                <div 
                  ref={imageContainerRef}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                  className="relative w-full aspect-square max-h-[360px] sm:max-h-[500px] my-auto mx-auto rounded-2xl sm:rounded-3xl overflow-hidden bg-[#ECE8E1] shadow-[0_10px_35px_rgba(0,0,0,0.06)] cursor-crosshair flex items-center justify-center p-2.5 sm:p-4"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImageIndex}
                      src={activeImageSrc}
                      alt={product.name}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ 
                        opacity: 1, 
                        scale: isZoomed ? 1.5 : 1,
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                      }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ 
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.25, ease: "easeOut" }
                      }}
                      className="w-full h-full object-contain select-none"
                    />
                  </AnimatePresence>

                  {/* Corner Brand Signature */}
                  <div className="absolute bottom-2.5 left-3.5 sm:bottom-3 sm:left-4 pointer-events-none z-10">
                    <span className="font-primary text-[11px] sm:text-[13px] tracking-[0.15em] uppercase text-secondary/40 font-medium drop-shadow-xs">
                      Kal Furniture Atelier
                    </span>
                  </div>
                </div>

                {/* Gallery Thumbnails Strip (if multiple photos) */}
                {images.length > 1 ? (
                  <div className="relative z-10 flex items-center justify-center gap-2.5 mt-4 pt-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden transition-all duration-300 relative ${
                          activeImageIndex === idx 
                            ? 'ring-2 ring-gold scale-105 shadow-md' 
                            : 'opacity-70 hover:opacity-100 border border-secondary/15 hover:scale-102'
                        }`}
                      >
                        <img 
                          src={resolveImageUrl(img)} 
                          alt="" 
                          className="w-full h-full object-contain p-1" 
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="relative z-10 flex items-center justify-center pt-2">
                    <span className="font-secondary text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-secondary/45 font-medium">
                      Studio Master Render • Full Set View
                    </span>
                  </div>
                )}

              </div>

              {/* ── RIGHT COLUMN: Editorial Details & Conversion Actions (5 cols) ── */}
              <div className="lg:col-span-5 bg-white flex flex-col justify-between overflow-hidden">
                
                {/* Scrollable Content Body */}
                <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-5 sm:p-8 space-y-5 sm:space-y-6">
                  
                  {/* Header & Title */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
                        Signature Collection
                      </span>
                      <span className="text-secondary/25">•</span>
                      <span className="font-secondary text-[11px] font-medium text-secondary/60 uppercase tracking-wider">
                        Handcrafted
                      </span>
                    </div>

                    <h2 className="font-primary text-3xl sm:text-4xl lg:text-[42px] font-normal text-secondary leading-tight tracking-tight">
                      {currentProd.name}
                    </h2>

                    {/* Price Block */}
                    <div className="flex items-baseline gap-3 mt-3 pb-4 border-b border-secondary/10">
                      <span className="font-secondary text-2xl sm:text-3xl font-bold text-gold flex items-baseline gap-1.5">
                        {formattedPrice} <span className="font-ethiopic text-base sm:text-lg font-normal text-secondary/75">ብር</span>
                      </span>
                      <span className="font-secondary text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-secondary/40 bg-secondary/5 px-2.5 py-1 rounded-full border border-secondary/10">
                        Addis Showroom Direct
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {currentProd.description && (
                    <p className="font-secondary text-[13.5px] sm:text-[14px] text-secondary/75 leading-relaxed">
                      {currentProd.description}
                    </p>
                  )}

                  {/* 🎨 Dynamic Swatches & Custom Color (if allowed) */}
                  {(isColorChoiceAllowed && (swatches.length > 0 || allowCustom)) && (
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-secondary/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.18em] text-secondary/70 flex items-center gap-1.5">
                          <PiPalette className="text-gold text-sm" /> Finish & Fabric Swatches
                        </span>
                        {getSelectedColorName() && (
                          <span className="font-secondary text-[11px] font-semibold text-gold capitalize">
                            {getSelectedColorName()}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {swatches.map((swatch, idx) => {
                          const swatchId = (swatch.id && String(swatch.id).trim()) || (swatch.label && String(swatch.label).trim()) || `swatch-${idx}`;
                          const isActive = !isCustomMode && activeSwatch?.label === swatch.label;
                          return (
                            <button
                              key={swatchId}
                              onClick={() => {
                                setActiveSwatch(swatch);
                                setIsCustomMode(false);
                              }}
                              className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-110 ring-2 ring-gold' : 'opacity-85 hover:opacity-100 hover:scale-105'}`}
                              title={swatch.label}
                            >
                              <div 
                                className="w-full h-full rounded-full border border-black/10 shadow-inner"
                                style={{ backgroundColor: swatch.color || "#836A58" }}
                              />
                            </button>
                          );
                        })}

                        {allowCustom && (
                          <button
                            onClick={() => setIsCustomMode(!isCustomMode)}
                            className={`px-3 py-1.5 rounded-full font-secondary text-[11px] font-semibold border transition-all duration-300 ${
                              isCustomMode
                                ? "bg-gold text-white border-gold shadow-xs"
                                : "bg-white text-secondary/70 border-secondary/20 hover:border-gold hover:text-gold"
                            }`}
                          >
                            + Custom Color
                          </button>
                        )}
                      </div>

                      {/* Custom Color Input */}
                      {isCustomMode && (
                        <div className="mt-3 flex items-center gap-2 bg-white border border-gold/40 rounded-full px-3.5 py-1.5 shadow-xs">
                          <span className="font-secondary text-[10px] font-bold text-gold uppercase tracking-wider">Custom:</span>
                          <input
                            type="text"
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            placeholder="e.g. Warm Bouclé, Forest Green"
                            className="bg-transparent font-secondary text-[12px] text-secondary focus:outline-none w-full"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Specifications or Luxury Cursive Hallmark Fallback ── */}
                  {isMissingSpecs ? (
                    <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FAF7F0] via-white to-[#F5EFE3] border border-gold/35 shadow-[0_4px_22px_rgba(217,182,110,0.12)]">
                      {/* Top Hallmark Tag */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-secondary text-[10px] font-bold uppercase tracking-[0.25em] text-gold-dark flex items-center gap-1.5">
                          <PiSparkleFill size={11} className="text-gold" />
                          Kal Signature Atelier
                        </span>
                        <span className="text-[10px] font-secondary uppercase tracking-widest text-secondary/40 font-medium">
                          Bespoke Masterpiece
                        </span>
                      </div>

                      {/* Readable Luxury Cursive Text */}
                      <div className="my-2.5">
                        <p className="font-cursive text-[36px] sm:text-[42px] text-[#0f172a] leading-[1.2] drop-shadow-xs select-none">
                          Your number one choice
                        </p>
                        <p className="font-secondary text-[12.5px] text-secondary/70 mt-1 leading-relaxed">
                          Handcrafted to order. Custom dimensions, curated wood finishes, and comprehensive structural warranty are personalized for your home.
                        </p>
                      </div>

                      {/* ── Interactive Horizontal Suite Pieces Rail (Image 3) ── */}
                      {suitePieces.length > 0 && (
                        <div className="mt-4 pt-3.5 border-t border-gold/25">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="font-secondary text-[10.5px] font-bold uppercase tracking-[0.2em] text-secondary/55">
                              EXPLORE SUITE PIECES ({suitePieces.length} INCLUDED)
                            </span>
                            {suitePieces.length > 2 && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => scrollRail("left")}
                                  className="w-6 h-6 rounded-full border border-secondary/15 hover:border-gold hover:text-gold flex items-center justify-center text-secondary/60 hover:bg-white text-xs transition-colors cursor-pointer"
                                  title="Previous piece"
                                  aria-label="Previous piece"
                                >
                                  ‹
                                </button>
                                <button
                                  type="button"
                                  onClick={() => scrollRail("right")}
                                  className="w-6 h-6 rounded-full border border-secondary/15 hover:border-gold hover:text-gold flex items-center justify-center text-secondary/60 hover:bg-white text-xs transition-colors cursor-pointer"
                                  title="Next piece"
                                  aria-label="Next piece"
                                >
                                  ›
                                </button>
                              </div>
                            )}
                          </div>

                          <div
                            ref={railRef}
                            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 pb-2 -mx-1"
                            style={{ scrollSnapType: "x mandatory" }}
                          >
                            {suitePieces.map((piece, idx) => {
                              const isSelected = activeProduct?.id === piece.id || activeProduct?.name === piece.name || activeProduct?.name === piece.fullName;
                              return (
                                <button
                                  key={piece.id || idx}
                                  type="button"
                                  onClick={() => handleSelectSuitePiece(piece)}
                                  style={{ scrollSnapAlign: "start" }}
                                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-2xl shrink-0 transition-all duration-300 text-left cursor-pointer border ${
                                    isSelected
                                      ? "bg-white ring-2 ring-gold border-transparent shadow-md scale-[1.02]"
                                      : "bg-white/90 hover:bg-white border-secondary/10 hover:border-gold/40 shadow-xs hover:shadow-sm"
                                  }`}
                                >
                                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#FAF8F5] shrink-0 border border-secondary/5 flex items-center justify-center p-0.5">
                                    <img
                                      src={piece.image}
                                      alt={piece.name}
                                      className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                  <div className="pr-1 min-w-[70px] max-w-[125px]">
                                    <span className="block font-secondary text-[9px] font-bold uppercase tracking-wider text-secondary/40">
                                      {piece.pieceLabel || `PIECE ${String(idx + 1).padStart(2, "0")}`}
                                    </span>
                                    <span className="block font-secondary text-[12px] font-bold text-secondary leading-tight truncate">
                                      {piece.name}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* All specs explicitly provided */
                    <div className="space-y-4">
                      <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-secondary/10">
                        <h4 className="font-secondary text-[11px] font-bold uppercase tracking-[0.2em] text-secondary/50 mb-3.5">
                          Piece Specifications & Craftsmanship
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          {specsList.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <div key={idx} className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                                  <Icon size={16} />
                                </div>
                                <div className="min-w-0">
                                  <span className="block font-secondary text-[10px] font-bold tracking-wider uppercase text-secondary/50">
                                    {item.label}
                                  </span>
                                  <span className="block font-secondary text-[12px] font-medium text-secondary leading-snug whitespace-pre-line mt-0.5">
                                    {item.value}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Also render the Suite Pieces Rail below specifications */}
                      {suitePieces.length > 0 && (
                        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-secondary/10">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="font-secondary text-[10.5px] font-bold uppercase tracking-[0.2em] text-secondary/50">
                              EXPLORE SUITE PIECES ({suitePieces.length} INCLUDED)
                            </span>
                            {suitePieces.length > 2 && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => scrollRail("left")}
                                  className="w-6 h-6 rounded-full border border-secondary/15 hover:border-gold hover:text-gold flex items-center justify-center text-secondary/60 hover:bg-white text-xs transition-colors cursor-pointer"
                                  title="Previous piece"
                                  aria-label="Previous piece"
                                >
                                  ‹
                                </button>
                                <button
                                  type="button"
                                  onClick={() => scrollRail("right")}
                                  className="w-6 h-6 rounded-full border border-secondary/15 hover:border-gold hover:text-gold flex items-center justify-center text-secondary/60 hover:bg-white text-xs transition-colors cursor-pointer"
                                  title="Next piece"
                                  aria-label="Next piece"
                                >
                                  ›
                                </button>
                              </div>
                            )}
                          </div>

                          <div
                            ref={railRef}
                            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 pb-1 -mx-1"
                            style={{ scrollSnapType: "x mandatory" }}
                          >
                            {suitePieces.map((piece, idx) => {
                              const isSelected = activeProduct?.id === piece.id || activeProduct?.name === piece.name || activeProduct?.name === piece.fullName;
                              return (
                                <button
                                  key={piece.id || idx}
                                  type="button"
                                  onClick={() => handleSelectSuitePiece(piece)}
                                  style={{ scrollSnapAlign: "start" }}
                                  className={`group flex items-center gap-2.5 px-3 py-2 rounded-2xl shrink-0 transition-all duration-300 text-left cursor-pointer border ${
                                    isSelected
                                      ? "bg-white ring-2 ring-gold border-transparent shadow-md scale-[1.02]"
                                      : "bg-white/80 hover:bg-white border-secondary/10 hover:border-gold/40 shadow-xs hover:shadow-sm"
                                  }`}
                                >
                                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#FAF8F5] shrink-0 border border-secondary/5 flex items-center justify-center p-0.5">
                                    <img
                                      src={piece.image}
                                      alt={piece.name}
                                      className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                  <div className="pr-1 min-w-[70px] max-w-[125px]">
                                    <span className="block font-secondary text-[9px] font-bold uppercase tracking-wider text-secondary/40">
                                      {piece.pieceLabel || `PIECE ${String(idx + 1).padStart(2, "0")}`}
                                    </span>
                                    <span className="block font-secondary text-[12px] font-bold text-secondary leading-tight truncate">
                                      {piece.name}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* White-Glove Guarantee Note */}
                  <div className="flex items-center gap-3 p-3.5 bg-secondary/[0.02] rounded-xl border border-secondary/8">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    <p className="font-secondary text-[12px] text-secondary/70 leading-snug">
                      White-Glove delivery and room-of-choice setup included within Addis Ababa.
                    </p>
                  </div>

                </div>

                {/* ── Fixed Sticky Action Footer ── */}
                <div className="bg-[#FAF8F5] border-t border-secondary/10 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-3 shadow-[0_-10px_25px_rgba(0,0,0,0.03)] sticky bottom-0 z-20">
                  
                  {/* Primary Action Button (Image 2 Design) */}
                  {currentProd.outOfStock ? (
                    <button
                      onClick={() => setIsMadeToOrderOpen(true)}
                      className="w-full sm:flex-1 h-12.5 px-6 flex items-center justify-center gap-2 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-secondary text-[12px] font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg active:scale-98 cursor-pointer whitespace-nowrap"
                    >
                      <PiHammerBold size={16} className="text-amber-200 shrink-0" />
                      <span>Order to be Made</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      disabled={isAdded}
                      className={`w-full sm:flex-1 h-12.5 px-6 sm:px-8 flex items-center justify-center gap-2.5 rounded-full font-secondary transition-all duration-300 active:scale-95 cursor-pointer shadow-[0_4px_16px_rgba(11,27,43,0.25)] hover:shadow-[0_6px_22px_rgba(11,27,43,0.35)] whitespace-nowrap min-w-0 ${
                        isAdded 
                          ? "bg-emerald-700 text-white shadow-emerald-700/25" 
                          : "bg-[#0B1B2B] hover:bg-[#142A42] text-white"
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {isAdded ? (
                          <motion.div
                            key="added"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-2 whitespace-nowrap"
                          >
                            <PiCheckCircleFill size={19} className="text-white shrink-0" />
                            <span className="text-[13.5px] font-semibold tracking-wide">
                              Added {getSelectedColorName() ? `(${getSelectedColorName()})` : "to Cart"}
                            </span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="add"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-2.5 whitespace-nowrap"
                          >
                            <PiShoppingCartSimpleLight size={20} className="text-white shrink-0" />
                            <span className="text-[13.5px] font-semibold tracking-wide">
                              Add to Cart
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  )}

                  {/* Secondary WhatsApp Showroom Concierge */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto h-12.5 px-5 sm:px-6 rounded-full border border-secondary/20 hover:border-gold hover:text-gold text-secondary flex items-center justify-center gap-2 font-secondary text-[12px] font-semibold tracking-wide transition-all duration-300 bg-white shadow-xs shrink-0 whitespace-nowrap"
                  >
                    <PiChatCircleDotsLight size={18} className="text-emerald-600 shrink-0" />
                    <span>Inquire Showroom</span>
                  </a>

                </div>

              </div>

            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Made-To-Order Request Modal */}
      <MadeToOrderModal 
        isOpen={isMadeToOrderOpen}
        onClose={() => setIsMadeToOrderOpen(false)}
        product={{ ...currentProd, selectedColor: getSelectedColorName() }}
      />
    </AnimatePresence>
  );
};

export default ProductModal;
