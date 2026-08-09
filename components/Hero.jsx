"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PiArrowRightLight, PiSparkleFill, PiTagLight } from "react-icons/pi";
import VideoModal from "./VideoModal";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useProducts } from "@/context/ProductContext";

const Hero = ({ initialProduct }) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const { heroProductId, heroProductData } = useSiteSettings();
  const { products } = useProducts();

  // Priority: 1. Context heroProductData, 2. Product in products array, 3. initialProduct passed from SSR
  const heroProduct = heroProductData || 
    products.find((p) => p.id === heroProductId || p.showInHero || (p.featured && p.images?.length)) || 
    initialProduct;

  const isJpeg = (url) => url && (url.endsWith(".jpg") || url.endsWith(".jpeg"));

  return (
    <section className="relative w-full min-h-[100svh] flex items-center overflow-hidden pt-28 pb-10 bg-surface">
      {/* Decorative Background Curve */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-30">
        <svg viewBox="0 0 500 500" className="w-full h-full text-gold" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 400 50 C 600 200, 100 400, 300 500" stroke="currentColor" strokeWidth="1" />
          <path d="M 350 20 C 700 300, 0 450, 250 550" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="150" cy="150" r="4" fill="currentColor" />
          <circle cx="350" cy="400" r="3" fill="currentColor" />
        </svg>
      </div>

      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-start pt-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-gold/15 text-gold font-secondary text-[11px] font-bold tracking-[0.2em] uppercase border border-gold/30 flex items-center gap-1.5 shadow-sm">
              <PiSparkleFill size={13} />
              {heroProduct ? `Hero Spotlight · ${heroProduct.category || "Featured"}` : "Trending Collections"}
            </span>
          </div>

          <h1 className="font-primary text-[42px] sm:text-[52px] md:text-[64px] lg:text-[72px] font-semibold leading-[1.05] tracking-[-0.02em] text-secondary mb-6">
            {heroProduct ? (
              <>
                {heroProduct.name} <br />
                <em className="not-italic text-gold">Masterpiece.</em>
              </>
            ) : (
              <>
                Elevate Your <br />
                Space <em className="not-italic text-gold">Beautifully.</em>
              </>
            )}
          </h1>

          <p className="font-secondary text-[16px] md:text-[18px] text-secondary/70 max-w-[440px] mb-10 leading-relaxed">
            {heroProduct?.description || "Discover stylish pieces for your home & kitchen that blend comfort, function & elegance."}
          </p>

          {heroProduct && (
            <div className="flex items-baseline gap-3 mb-8 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-secondary/10 shadow-sm">
              <span className="font-secondary text-[11px] font-bold uppercase tracking-widest text-secondary/50">
                Special Offer:
              </span>
              <span className="font-primary text-[28px] text-gold font-semibold leading-none">
                {(heroProduct.price || 0).toLocaleString()} ETB
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-12">
            <Link href={heroProduct ? `/collections?product=${heroProduct.id}` : "/collections"}>
              <button className="px-8 py-3.5 bg-primary text-white font-secondary text-[14px] font-medium rounded-full shadow-[0_8px_20px_rgba(155,92,53,0.3)] hover:bg-gold transition-colors hover:shadow-lg hover:-translate-y-0.5">
                {heroProduct ? "View Spotlight Piece" : "Explore Collection"}
              </button>
            </Link>
            <Link 
              href="/packages"
              className="group flex items-center gap-3 text-secondary hover:text-gold transition-colors"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full border border-secondary/20 group-hover:border-gold/50 transition-colors bg-white">
                <PiArrowRightLight size={24} />
              </div>
              <span className="font-secondary text-[14px] font-semibold">Explore Packages</span>
            </Link>
          </div>

        </motion.div>

        {/* Right Image area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative w-full h-[450px] sm:h-[500px] lg:h-[600px] flex items-center justify-center"
        >
          <div className="relative w-full h-full max-w-[500px] flex items-center justify-center">
            {/* The main spotlight image */}
            <img 
              src={
                heroProduct?.images?.[0] || 
                "/assets/img/hero/beige-chair.jpeg"
              } 
              alt={heroProduct?.name || "Cozy Beige Accent Chair"}
              className={`max-w-full max-h-full transition-all duration-700 ${
                heroProduct && isJpeg(heroProduct.images?.[0]) 
                  ? "object-cover rounded-3xl shadow-2xl border border-secondary/10" 
                  : "object-contain object-center drop-shadow-2xl mix-blend-multiply"
              }`}
            />
          </div>
        </motion.div>
      </div>

      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
    </section>
  );
};

export default Hero;