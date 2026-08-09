"use client";

import { useSiteSettings } from "@/context/SiteSettingsContext";
import { PiArrowRightLight } from "react-icons/pi";
import Link from "next/link";

export default function PromoBanner({ initialPromoSettings }) {
  const { promoSettings: contextSettings } = useSiteSettings();
  const promoSettings = contextSettings || initialPromoSettings;

  if (!promoSettings || !promoSettings.enabled) {
    return null;
  }

  const {
    title = "Complete your home with Curated Packages",
    subtitle = "Discover our premium furniture bundles at exclusive promotional prices. Elevate your entire living space instantly.",
    buttonText = "Explore Packages",
    buttonLink = "/packages",
    image = "/assets/img/hero/beige-chair.jpeg",
    bgColor = "#DFD2C1",
  } = promoSettings;

  return (
    <section className="py-12 md:py-20 bg-surface">
      <div className="container">
        <div 
          className="rounded-[32px] overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-16 relative border border-secondary/10 shadow-sm"
          style={{ backgroundColor: bgColor }}
        >
          <div className="relative z-10 w-full md:max-w-lg mb-8 md:mb-0">
            <h2 className="font-primary text-[28px] md:text-[40px] font-semibold text-secondary leading-[1.1] mb-4 whitespace-pre-line">
              {title}
            </h2>
            <p className="font-secondary text-[14px] md:text-[15px] text-secondary/80 mb-8 max-w-sm leading-relaxed">
              {subtitle}
            </p>
            <Link 
              href={buttonLink || "/packages"} 
              className="inline-flex items-center gap-3 bg-primary text-white rounded-full px-6 py-3.5 md:px-8 md:py-4 font-secondary text-[12px] md:text-[13px] font-bold tracking-widest uppercase hover:bg-gold transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {buttonText}
              <PiArrowRightLight size={20} />
            </Link>
          </div>
          
          {/* Banner image */}
          {image && (
            <div className="w-full md:w-1/2 flex justify-center md:justify-end items-end relative z-0 md:absolute right-0 bottom-0 top-0">
              <img 
                src={image} 
                alt="Promotional Banner"
                className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] object-contain drop-shadow-2xl mix-blend-multiply md:translate-x-8 md:translate-y-8 translate-y-6"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
