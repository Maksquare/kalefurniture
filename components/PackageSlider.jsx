"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PiArrowRightLight, 
  PiArrowLeftLight, 
  PiShoppingCartSimpleBold,
  PiCheckCircleFill,
  PiChatCircleDotsLight,
  PiShieldCheckLight,
  PiSparkleLight,
  PiRulerLight,
  PiCubeLight,
  PiCrownLight,
  PiPackageLight,
  PiMagnifyingGlassPlusLight
} from "react-icons/pi";
import { usePackages } from "@/context/PackageContext";
import { useCart } from "@/context/CartContext";
import { resolveImageUrl } from "@/lib/imageUtils";

// Helper to clean up titles (e.g. "KAL SIGNATUREe" -> "Kal Signature Suite")
const formatSuiteTitle = (name) => {
  if (!name) return "Kal Signature Suite";
  let cleaned = name.trim();
  if (cleaned.toLowerCase().endsWith("signaturee")) {
    cleaned = cleaned.slice(0, -1);
  }
  if (!cleaned.toLowerCase().includes("suite") && !cleaned.toLowerCase().includes("bundle")) {
    cleaned = `${cleaned} Suite`;
  }
  return cleaned;
};

// Helper to extract or synthesize clean specs
const getCleanSpecs = (item) => {
  const specs = [];
  if (item?.specs && typeof item.specs === "object") {
    Object.entries(item.specs).forEach(([k, v]) => {
      if (v && typeof v === "string" && v.trim()) {
        specs.push({ label: k, value: v.trim() });
      }
    });
  }
  if (specs.length === 0 && item?._rawSpecs) {
    specs.push({ label: "Dimensions", value: String(item._rawSpecs).trim() });
  }
  if (specs.length === 0) {
    specs.push(
      { label: "Craftsmanship", value: "Solid Hardwood Frame & High-Density Core" },
      { label: "Sizing", value: "Bespoke / Custom Living Room Proportions" }
    );
  }
  return specs;
};

const PackageView = ({ pkg }) => {
  const { addToCart } = useCart();
  const [activeItemIdx, setActiveItemIdx] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef(null);

  const items = Array.isArray(pkg.items) && pkg.items.length > 0 
    ? pkg.items 
    : [{ name: pkg.name, image: pkg.mainImage, specs: {} }];
  
  const activeItem = items[activeItemIdx] || items[0];
  const activeImageSrc = resolveImageUrl(activeItem?.image || pkg.mainImage);
  const activeSpecs = getCleanSpecs(activeItem);

  const suitePrice = pkg.price || 0;
  // Estimated individual retail value calculation (showing ~18-20% bundle savings)
  const estimatedRetailValue = Math.round((suitePrice * 1.18) / 1000) * 1000;
  const bundleSavings = estimatedRetailValue - suitePrice;

  const handleAddSuiteToCart = () => {
    if (isAdded) return;
    addToCart({
      id: pkg.id,
      name: formatSuiteTitle(pkg.name),
      price: pkg.price,
      images: [activeImageSrc || pkg.mainImage],
      quantity: 1,
      isPackage: true,
      piecesCount: items.length
    });
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

  const itemsListString = items.map((it, idx) => `${idx + 1}. ${it.name}`).join(", ");
  const whatsappUrl = `https://wa.me/251936358805?text=${encodeURIComponent(
    `Hello Kal Furniture Showroom, I am interested in the ${formatSuiteTitle(pkg.name)} package (${suitePrice.toLocaleString()} ብር) which includes: ${itemsListString}. Can you advise on custom room sizing, wood finishes, and delivery timeline?`
  )}`;

  return (
    <div className="w-full bg-white rounded-3xl sm:rounded-[2.5rem] border border-secondary/10 shadow-[0_15px_50px_rgba(0,0,0,0.04)] overflow-hidden">
      
      {/* ── Top Suite Header Bar ── */}
      <div className="bg-[#FAF8F5] border-b border-secondary/10 px-6 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-gold/15 text-gold font-secondary text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] border border-gold/30 flex items-center gap-1.5">
            <PiCrownLight className="text-gold text-sm" />
            {pkg.collection || "Architectural Suite"}
          </span>
          <span className="text-secondary/25">•</span>
          <span className="font-secondary text-[12px] font-semibold text-secondary/70 flex items-center gap-1.5">
            <PiPackageLight className="text-gold" />
            {items.length} Coordinated Pieces
          </span>
        </div>

        {/* Savings Highlight Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-600/10 border border-emerald-600/20 text-emerald-800 font-secondary text-[11px] font-bold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>Save ~{bundleSavings.toLocaleString()} <span className="font-ethiopic">ብር</span> as a Curated Ensemble</span>
        </div>
      </div>

      {/* ── Main Split Showcase ── */}
      <div className="p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* ── LEFT COLUMN: Architectural Visual Viewport (7 cols) ── */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          {/* Main Visual Stage */}
          <div 
            ref={imageContainerRef}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F6F3EC] border border-secondary/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] cursor-crosshair flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageSrc || 'active-pkg-img'}
                src={activeImageSrc}
                alt={activeItem?.name || pkg.name}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ 
                  opacity: 1, 
                  scale: isZoomed ? 1.45 : 1,
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ 
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.25, ease: "easeOut" }
                }}
                className="w-full h-full object-cover select-none"
              />
            </AnimatePresence>

            {/* Top-Left Active Item Floating Chip */}
            <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-black/5 font-secondary text-[11px] font-bold uppercase tracking-wider text-secondary shadow-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span>Viewing: <strong className="text-primary">{activeItem.name}</strong></span>
              <span className="text-secondary/40 font-normal ml-1">({activeItemIdx + 1} of {items.length})</span>
            </div>

            {/* Top-Right Magnify Prompt */}
            <div className="hidden sm:flex absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-secondary text-[10px] font-semibold uppercase tracking-wider items-center gap-1">
              <PiMagnifyingGlassPlusLight /> Hover to Zoom
            </div>

            {/* Bottom Brand Watermark */}
            <div className="absolute bottom-3 left-4 pointer-events-none z-10">
              <span className="font-primary text-[13px] tracking-[0.15em] uppercase text-secondary/40 font-medium drop-shadow-xs">
                Kal Furniture • Master Suite
              </span>
            </div>
          </div>

          {/* Active Piece Specification Badges */}
          <div className="w-full mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {activeSpecs.map((spec, sIdx) => (
              <div 
                key={sIdx}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-secondary/10 shadow-xs flex items-center gap-2 text-center"
              >
                <span className="font-secondary text-[10px] font-bold uppercase tracking-wider text-secondary/50">
                  {spec.label}:
                </span>
                <span className="font-secondary text-[11.5px] font-semibold text-secondary">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>

          {/* Interactive Suite Piece Thumbnails Strip (Smooth Horizontal Rail) */}
          {items.length > 1 && (
            <div className="w-full flex flex-col items-center mt-6 pt-2">
              <span className="font-secondary text-[10.5px] font-bold uppercase tracking-[0.2em] text-secondary/45 mb-2.5">
                Explore Suite Pieces ({items.length} Included)
              </span>
              <div 
                className="flex items-center gap-3 max-w-full overflow-x-auto no-scrollbar scroll-smooth py-1.5 px-1"
                style={{ scrollSnapType: "x mandatory" }}
              >
                {items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveItemIdx(idx)}
                    style={{ scrollSnapAlign: "start" }}
                    className={`group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shrink-0 transition-all duration-300 cursor-pointer ${
                      activeItemIdx === idx 
                        ? "bg-white ring-2 ring-gold shadow-md scale-[1.02] border-transparent" 
                        : "bg-[#FAF8F5] hover:bg-white border border-secondary/10 opacity-80 hover:opacity-100 shadow-xs"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#ECE8E1] shrink-0 border border-secondary/5">
                      <img 
                        src={resolveImageUrl(item.image)} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="text-left pr-1 min-w-[70px] max-w-[130px]">
                      <span className="block font-secondary text-[9px] font-bold uppercase tracking-wider text-secondary/40">
                        Piece {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="block font-secondary text-[12px] font-bold text-secondary leading-tight truncate">
                        {item.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT COLUMN: Configuration, Value & Actions (5 cols) ── */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
          
          <div>
            {/* Title & Collection */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
                Curated Ensemble
              </span>
              <span className="text-secondary/20">•</span>
              <span className="font-secondary text-[11px] font-medium text-secondary/60 uppercase tracking-wider">
                Full Room Solution
              </span>
            </div>

            <h2 className="font-primary text-[34px] sm:text-[42px] lg:text-[46px] font-normal text-secondary leading-[1.08] tracking-tight mb-3">
              {formatSuiteTitle(pkg.name)}
            </h2>

            {/* Price & Smart Math Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-secondary/10 mb-5">
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <div>
                  <span className="block font-secondary text-[10px] font-bold uppercase tracking-wider text-secondary/40">
                    Individual Item Value
                  </span>
                  <span className="font-secondary text-sm sm:text-base text-secondary/50 line-through">
                    {estimatedRetailValue.toLocaleString()} <span className="font-ethiopic text-xs">ብር</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-secondary text-[10px] font-bold uppercase tracking-wider text-gold">
                    Package Price
                  </span>
                  <span className="font-secondary text-2xl sm:text-3xl font-bold text-primary">
                    {suitePrice.toLocaleString()} <span className="text-sm font-normal text-secondary/60 font-ethiopic">ብር</span>
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-secondary/10 flex items-center justify-between text-[11px] font-secondary font-semibold">
                <span className="text-emerald-700">✦ Total Bundle Savings:</span>
                <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Save {bundleSavings.toLocaleString()} <span className="font-ethiopic">ብር</span>
                </span>
              </div>
            </div>

            {/* Suite Editorial Description */}
            <p className="font-secondary text-[13.5px] sm:text-[14px] text-secondary/75 leading-relaxed mb-6">
              {pkg.description || "The ultimate curated collection. Transform your entire living space with our premium selection of matching, high-end pieces tailored by Kal Furniture artisans."}
            </p>

            {/* "What's Included in this Suite" Interactive Cards */}
            <div className="space-y-2.5 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.2em] text-secondary/50">
                  Included in this Suite ({items.length} items)
                </span>
                <span className="font-secondary text-[10px] text-secondary/40 italic">
                  Tap to preview in stage
                </span>
              </div>

              {items.map((item, i) => {
                const isItemActive = activeItemIdx === i;
                const rawSpec = item._rawSpecs || (item.specs && Object.values(item.specs).join(" · ")) || "Solid ash wood, high-resilience foam";
                return (
                  <div
                    key={i}
                    onClick={() => setActiveItemIdx(i)}
                    className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                      isItemActive
                        ? "bg-white border-gold shadow-sm ring-1 ring-gold/40"
                        : "bg-[#FAF8F5] border-secondary/10 hover:border-gold/30 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isItemActive ? "bg-gold text-white" : "bg-secondary/10 text-secondary/50"
                      }`}>
                        <PiCheckCircleFill size={15} />
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-secondary text-[13px] font-semibold truncate ${
                          isItemActive ? "text-secondary font-bold" : "text-secondary/80"
                        }`}>
                          {item.name}
                        </h4>
                        <p className="font-secondary text-[11px] text-secondary/55 truncate">
                          {rawSpec}
                        </p>
                      </div>
                    </div>

                    <span className={`font-secondary text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      isItemActive ? "text-gold" : "text-secondary/30"
                    }`}>
                      {isItemActive ? "Viewing" : "Select"}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* ── Conversion Actions ── */}
          <div className="pt-4 border-t border-secondary/10 space-y-3">
            
            {/* Primary Add Suite to Cart */}
            <button
              onClick={handleAddSuiteToCart}
              disabled={isAdded}
              className={`w-full h-13 px-6 py-3.5 flex items-center justify-center gap-2 rounded-full font-secondary text-[12px] font-bold tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg active:scale-98 cursor-pointer ${
                isAdded 
                  ? "bg-emerald-600 text-white shadow-emerald-500/25" 
                  : "bg-primary text-white hover:bg-gold hover:text-white"
              }`}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.div
                    key="added"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2"
                  >
                    <PiCheckCircleFill size={19} />
                    Added Complete Suite to Cart
                  </motion.div>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2"
                  >
                    <PiShoppingCartSimpleBold size={18} />
                    Add Complete Suite to Cart
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Secondary WhatsApp Concierge Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 px-5 rounded-full border border-secondary/20 hover:border-gold hover:text-gold text-secondary flex items-center justify-center gap-2 font-secondary text-[12px] font-bold tracking-wider uppercase transition-all duration-300 bg-white shadow-xs"
            >
              <PiChatCircleDotsLight size={19} className="text-emerald-600" />
              <span>Consult Concierge via WhatsApp</span>
            </a>

            {/* White-Glove Reassurance line */}
            <div className="flex items-center justify-center gap-2 pt-1 text-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <p className="font-secondary text-[11px] text-secondary/60">
                Includes complimentary White-Glove delivery & assembly in Addis Ababa
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ── Brand Trust & Craftsmanship Footer Strip ── */}
      <div className="bg-[#FAF8F5] border-t border-secondary/10 px-6 sm:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center mb-1">
            <PiShieldCheckLight size={22} />
          </div>
          <span className="font-secondary text-[12px] font-bold uppercase tracking-wider text-secondary">100% Solid Hardwood</span>
          <span className="font-secondary text-[11px] text-secondary/60">Kiln-dried ash & mahogany</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center mb-1">
            <PiSparkleLight size={22} />
          </div>
          <span className="font-secondary text-[12px] font-bold uppercase tracking-wider text-secondary">Bespoke Finishes</span>
          <span className="font-secondary text-[11px] text-secondary/60">Custom fabrics & wood stains</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center mb-1">
            <PiRulerLight size={22} />
          </div>
          <span className="font-secondary text-[12px] font-bold uppercase tracking-wider text-secondary">Made to Measure</span>
          <span className="font-secondary text-[11px] text-secondary/60">Custom room sizing on request</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold flex items-center justify-center mb-1">
            <PiCheckCircleFill size={22} className="text-gold" />
          </div>
          <span className="font-secondary text-[12px] font-bold uppercase tracking-wider text-secondary">White-Glove Delivery</span>
          <span className="font-secondary text-[11px] text-secondary/60">Free setup across Addis Ababa</span>
        </div>
      </div>

    </div>
  );
};

export default function PackageSlider() {
  const { packages, isLoaded } = usePackages();
  const [activePackageIndex, setActivePackageIndex] = useState(0);

  const totalPackages = packages.length;

  const handlePrev = () => {
    setActivePackageIndex((prev) => (prev > 0 ? prev - 1 : totalPackages - 1));
  };

  const handleNext = () => {
    setActivePackageIndex((prev) => (prev < totalPackages - 1 ? prev + 1 : 0));
  };

  const currentPackage = packages[activePackageIndex] || packages[0];

  return (
    <section aria-label="Curated furniture packages" className="w-full">
      <div className="container px-4 sm:px-6 lg:px-12 mx-auto">
        
        {/* ── Top Suite Selector Bar (Smart & Practical) ── */}
        {totalPackages > 1 && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-5 border-b border-secondary/10">
            <div>
              <span className="font-secondary text-[11px] font-bold tracking-[0.25em] uppercase text-gold block mb-1">
                Curated Architectural Suites
              </span>
              <p className="font-primary text-[24px] sm:text-[28px] font-normal text-secondary">
                Select Suite to Explore
              </p>
            </div>

            {/* Suite Tabs & Arrows */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-[#FAF8F5] p-1.5 rounded-full border border-secondary/10">
                {packages.map((pkg, idx) => {
                  const isActive = activePackageIndex === idx;
                  const title = formatSuiteTitle(pkg.name);
                  const price = (pkg.price || 0).toLocaleString();
                  return (
                    <button
                      key={pkg.id || idx}
                      onClick={() => setActivePackageIndex(idx)}
                      className={`px-4 sm:px-5 py-2 rounded-full font-secondary text-[11.5px] sm:text-[12px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? "bg-primary text-white shadow-md"
                          : "text-secondary/70 hover:text-secondary hover:bg-white"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-gold' : 'bg-secondary/30'}`} />
                      <span>{title}</span>
                      <span className={`hidden sm:inline text-[10px] font-normal ${isActive ? 'text-white/70' : 'text-secondary/50'}`}>
                        ({price} <span className="font-ethiopic">ብር</span>)
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full border border-secondary/20 flex items-center justify-center text-secondary hover:bg-gold hover:text-white hover:border-gold transition-all duration-300 bg-white shadow-xs cursor-pointer"
                  aria-label="Previous suite"
                >
                  <PiArrowLeftLight size={18} />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full border border-secondary/20 flex items-center justify-center text-secondary hover:bg-gold hover:text-white hover:border-gold transition-all duration-300 bg-white shadow-xs cursor-pointer"
                  aria-label="Next suite"
                >
                  <PiArrowRightLight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Active Suite Showcase View ── */}
        {!isLoaded ? (
          <div className="w-full h-96 rounded-3xl bg-secondary/5 animate-pulse flex items-center justify-center text-secondary/40 font-secondary">
            Loading curated packages...
          </div>
        ) : !currentPackage ? (
          <div className="w-full py-16 text-center text-secondary/50 font-secondary">
            No packages available at this time.
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPackage.id || activePackageIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <PackageView pkg={currentPackage} />
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </section>
  );
}