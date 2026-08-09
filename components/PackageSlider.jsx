"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Check,
  Crown,
  Sparkles,
  Truck,
  ShieldCheck,
  Package,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { usePackages } from "@/context/PackageContext";

/* ─────────────────────────────────────────
   PACKAGE CARD
───────────────────────────────────────── */
const PackageCard = ({ pkg }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const activeItem = pkg.items?.[activeIdx] || pkg.items?.[0];
  const isJpeg = (url) => url && (url.endsWith(".jpg") || url.endsWith(".jpeg"));

  const handleAdd = () => {
    if (isAdded) return;
    addToCart({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      images: [pkg.mainImage || activeItem?.image],
      quantity: 1,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <article className="group snap-start shrink-0 w-[88vw] sm:w-[400px] lg:w-[420px] bg-white rounded-3xl border border-secondary/10 overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.14)]">

      {/* Hero Image Stage */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#FAFAFA]">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeItem?.image || pkg.mainImage}
            src={activeItem?.image || pkg.mainImage}
            alt={activeItem?.name || pkg.name}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-[1.03] ${
              isJpeg(activeItem?.image || pkg.mainImage)
                ? "object-cover"
                : "object-contain mix-blend-multiply p-6"
            }`}
          />
        </AnimatePresence>

        {/* Badges */}
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-secondary font-secondary text-[10px] font-bold uppercase tracking-[0.14em] border border-secondary/10 flex items-center gap-1.5">
          <Crown size={11} className="text-gold" />
          {pkg.collection}
        </span>

        <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gold text-white font-secondary text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-1.5">
          <Package size={11} />
          {pkg.items?.length || 0} Pieces
        </span>

        {/* Piece Thumb Strip (only if multiple items) */}
        {pkg.items?.length > 1 && (
          <div className="absolute bottom-3 inset-x-3 flex gap-2">
            {pkg.items.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  activeIdx === i ? "bg-gold" : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`View ${item.name}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">

        {/* Current piece label */}
        {pkg.items?.length > 1 && (
          <p className="font-secondary text-[10px] font-bold uppercase tracking-[0.15em] text-gold mb-1">
            {activeItem?.name} · {activeIdx + 1}/{pkg.items.length}
          </p>
        )}

        <h3 className="font-primary text-[22px] sm:text-[24px] text-secondary font-normal leading-tight mb-3">
          {pkg.name}
        </h3>

        {pkg.description && (
          <p className="font-secondary text-[12.5px] text-secondary/60 leading-relaxed mb-4 line-clamp-2">
            {pkg.description}
          </p>
        )}

        {/* Items checklist */}
        {pkg.items?.length > 0 && (
          <ul className="space-y-1.5 mb-5">
            {pkg.items.map((item, i) => (
              <li
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`flex items-center gap-2 font-secondary text-[12px] cursor-pointer transition-colors duration-150 ${
                  activeIdx === i ? "text-secondary font-semibold" : "text-secondary/55 hover:text-secondary/80"
                }`}
              >
                <Check
                  size={12}
                  strokeWidth={2.5}
                  className={activeIdx === i ? "text-gold" : "text-secondary/30"}
                />
                {item.name}
              </li>
            ))}
          </ul>
        )}

        {/* Specs for active item */}
        {activeItem?.specs && (
          <div className="flex flex-wrap gap-1.5 mb-5 pb-4 border-b border-secondary/8">
            {Object.entries(activeItem.specs).slice(0, 4).map(([k, v]) => (
              <span key={k} className="px-2 py-0.5 rounded-full bg-secondary/5 font-secondary text-[10px] text-secondary/60">
                {k}: {v}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <span className="font-secondary text-[10px] font-bold uppercase tracking-[0.1em] text-secondary/40 block mb-0.5">
              Bundle Price
            </span>
            <span className="font-primary text-[22px] sm:text-[24px] text-gold font-semibold leading-none">
              {(pkg.price || 0).toLocaleString()} ETB
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isAdded}
            className={`h-11 px-5 rounded-full font-secondary text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shrink-0 transition-all duration-300 ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-gold text-primary shadow-[0_4px_18px_rgba(217,182,110,0.4)] hover:shadow-[0_6px_24px_rgba(217,182,110,0.5)] active:scale-95"
            }`}
          >
            {isAdded ? (
              <>
                <Check size={15} strokeWidth={2.5} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>

        {/* Warranty badge */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-secondary/8">
          <ShieldCheck size={13} className="text-gold shrink-0" />
          <span className="font-secondary text-[11px] text-secondary/50">10-Year Structural Warranty</span>
        </div>

      </div>
    </article>
  );
};

/* ─────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="snap-start shrink-0 w-[88vw] sm:w-[400px] lg:w-[420px] rounded-3xl border border-secondary/10 overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-secondary/5" />
    <div className="p-5 sm:p-6 space-y-3">
      <div className="h-3 w-1/3 bg-secondary/8 rounded" />
      <div className="h-5 w-2/3 bg-secondary/10 rounded" />
      <div className="h-3 w-full bg-secondary/5 rounded" />
      <div className="h-3 w-5/6 bg-secondary/5 rounded" />
      <div className="h-3 w-4/6 bg-secondary/5 rounded" />
      <div className="flex justify-between mt-4 pt-4 border-t border-secondary/8">
        <div className="h-6 w-1/3 bg-secondary/8 rounded" />
        <div className="h-9 w-24 bg-gold/20 rounded-full" />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────── */
const EmptyState = () => (
  <div className="w-full min-h-[300px] flex flex-col items-center justify-center py-16 text-center px-4">
    <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-4">
      <Package size={24} />
    </div>
    <p className="font-primary text-[20px] text-secondary mb-2">No packages yet</p>
    <p className="font-secondary text-[13px] text-secondary/50 max-w-xs leading-relaxed">
      Packages created from the admin dashboard will appear here automatically.
    </p>
  </div>
);

/* ─────────────────────────────────────────
   GUARANTEE STRIP
───────────────────────────────────────── */
const guarantees = [
  { icon: Crown, label: "Solid Ash Wood", desc: "Kiln-dried hardwood frames for lifetime stability." },
  { icon: Sparkles, label: "Bespoke Finishes", desc: "Custom fabrics and wood stains on request." },
  { icon: Truck, label: "White-Glove Delivery", desc: "Complimentary assembly and packaging removal." },
  { icon: ShieldCheck, label: "10-Year Warranty", desc: "Backed by Kal Furniture master artisans." },
];

const GuaranteeStrip = () => (
  <div className="container px-4 sm:px-6 lg:px-12 mx-auto mt-12 sm:mt-16">
    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 border border-secondary/10 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
      {guarantees.map(({ icon: Icon, label, desc }) => (
        <div key={label} className="flex items-start gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <Icon size={20} />
          </div>
          <div>
            <h5 className="font-primary text-[15px] sm:text-[17px] text-secondary mb-0.5">{label}</h5>
            <p className="font-secondary text-[11px] sm:text-[12px] text-secondary/60 leading-relaxed">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────
   MAIN SLIDER
───────────────────────────────────────── */
export default function PackageSlider() {
  const { packages, isLoaded } = usePackages();
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const trackRef = useRef(null);

  /* Scroll state sync */
  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 8);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);

    const children = Array.from(el.children);
    let closest = 0;
    let minDist = Infinity;
    children.forEach((child, i) => {
      const dist = Math.abs(child.offsetLeft - el.scrollLeft);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, isLoaded]);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[0];
    if (!card) return;
    const gap = 24;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  const scrollToIndex = (i) => {
    const el = trackRef.current;
    const card = el?.children[i];
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); scrollByCard(1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); scrollByCard(-1); }
  };

  return (
    <section aria-label="Curated furniture packages" className="w-full">

      {/* Count + Controls row */}
      <div className="container px-4 sm:px-6 lg:px-12 mx-auto flex items-center justify-between mb-5 sm:mb-8">
        <p className="font-secondary text-[12px] text-secondary/50 tracking-[0.04em]">
          {!isLoaded
            ? "Loading…"
            : `${packages.length} package${packages.length === 1 ? "" : "s"} available`}
        </p>

        {/* Desktop arrows */}
        {isLoaded && packages.length > 1 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollPrev}
              aria-label="Previous packages"
              className="w-10 h-10 rounded-full border border-secondary/15 flex items-center justify-center text-secondary transition-all duration-200 hover:border-gold hover:text-gold disabled:opacity-25 disabled:pointer-events-none"
            >
              <ChevronLeft size={17} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => scrollByCard(1)}
              disabled={!canScrollNext}
              aria-label="Next packages"
              className="w-10 h-10 rounded-full border border-secondary/15 flex items-center justify-center text-secondary transition-all duration-200 hover:border-gold hover:text-gold disabled:opacity-25 disabled:pointer-events-none"
            >
              <ChevronRight size={17} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>

      {/* Edge-fade + Track */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 sm:w-12 bg-gradient-to-r from-[#FAF8F5] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 sm:w-12 bg-gradient-to-l from-[#FAF8F5] to-transparent z-10" />

        <div
          ref={trackRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          aria-label="Swipe or use arrow keys to browse packages"
          className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 sm:px-6 lg:px-12 pb-4 focus-visible:outline-none"
        >
          {!isLoaded
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : packages.length === 0
            ? <EmptyState />
            : packages.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)
          }
        </div>
      </div>

      {/* Dot indicators */}
      {isLoaded && packages.length > 1 && (
        <div className="flex justify-center gap-2 mt-6" aria-hidden="true">
          {packages.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-gold" : "w-1.5 bg-secondary/15 hover:bg-secondary/30"
              }`}
              aria-label={`Go to package ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile prev/next under track */}
      {isLoaded && packages.length > 1 && (
        <div className="flex sm:hidden items-center justify-center gap-3 mt-5">
          <button
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollPrev}
            className="w-11 h-11 rounded-full border border-secondary/15 flex items-center justify-center text-secondary disabled:opacity-25"
            aria-label="Previous packages"
          >
            <ChevronLeft size={17} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            disabled={!canScrollNext}
            className="w-11 h-11 rounded-full border border-secondary/15 flex items-center justify-center text-secondary disabled:opacity-25"
            aria-label="Next packages"
          >
            <ChevronRight size={17} strokeWidth={1.75} />
          </button>
        </div>
      )}

      {/* Artisanal Guarantee Strip */}
      {isLoaded && <GuaranteeStrip />}

    </section>
  );
}