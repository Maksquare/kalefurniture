import Hero from "@/components/Hero";
import Collections from "@/components/Collections";
import ProductGrid from "@/components/ProductGrid";
import { PiArrowRightLight } from "react-icons/pi";

import Link from "next/link";

const PromoBanner = () => (
  <section className="py-12 md:py-20 bg-surface">
    <div className="container">
      <div className="bg-[#DFD2C1] rounded-[32px] overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-16 relative">
        <div className="relative z-10 w-full md:max-w-lg mb-8 md:mb-0">
          <h2 className="font-primary text-[28px] md:text-[40px] font-semibold text-secondary leading-[1.1] mb-4">
            Complete your home with <br className="hidden sm:block" /> 
            <span className="text-primary text-[36px] md:text-[56px] italic">Curated Packages</span>
          </h2>
          <p className="font-secondary text-[15px] text-secondary/80 mb-8 max-w-sm">
            Discover our premium furniture bundles at exclusive promotional prices. Elevate your entire living space instantly.
          </p>
          <Link href="/packages" className="inline-flex items-center gap-3 bg-primary text-white rounded-full px-6 py-3.5 md:px-8 md:py-4 font-secondary text-[12px] md:text-[13px] font-bold tracking-widest uppercase hover:bg-gold transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Explore Packages
            <PiArrowRightLight size={20} />
          </Link>
        </div>
        
        {/* Decorative elements / background image for banner */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end items-end relative z-0 md:absolute right-0 bottom-0 top-0">
          <img 
            src="/assets/img/hero/beige-chair.jpeg" 
            alt="Promo"
            className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] object-contain drop-shadow-2xl mix-blend-multiply md:translate-x-12 md:translate-y-12 translate-y-8"
          />
        </div>
      </div>
    </div>
  </section>
);

const Home = () => {
  return (
    <div className="overflow-hidden min-h-screen bg-surface">
      <Hero />
      <Collections />
      <ProductGrid />
      <PromoBanner />
    </div>
  );
};

export default Home;