"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PiArrowRightLight } from "react-icons/pi";
import { useProducts } from "@/context/ProductContext";
import { resolveImageUrl } from "@/lib/imageUtils";

const Collections = () => {
  const { products, isLoaded } = useProducts();

  // Get actual catalog products with images
  const livingRoomProducts = products.filter(p => (p.category === "Living Room" || p.category === "living-room") && p.images?.length > 0);
  const diningProducts = products.filter(p => (p.category === "Dining Area" || p.category === "Dining Room" || p.category === "Kitchen Cabinet") && p.images?.length > 0);

  // Prioritize featured or first actual product from live catalog
  const featuredLivingRoom = livingRoomProducts.find(p => p.featured) || livingRoomProducts[0];
  const featuredDining = diningProducts.find(p => p.featured) || diningProducts[0];

  const livingRoomImg = featuredLivingRoom?.images?.[0]
    ? resolveImageUrl(featuredLivingRoom.images[0])
    : "/ksf009-preview.webp";
  const kitchenImg = featuredDining?.images?.[0]
    ? resolveImageUrl(featuredDining.images[0])
    : "https://kalefurnitures.com/uploads/1791344716_95df2ad4_Elegant_Gold_Dining_Set_on_Mar.png";

  return (
    <section className="py-24 bg-surface">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Card 1: Living Room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative bg-gradient-to-br from-[#F5EFE7] to-[#EAE2D5] rounded-4xl overflow-hidden flex flex-col sm:flex-row items-center min-h-[340px] h-auto sm:h-[340px] border border-secondary/10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_45px_rgba(6,35,53,0.08)] transition-all duration-500"
          >
            <div className="relative z-10 w-full sm:w-[55%] p-8 lg:p-10 h-full flex flex-col justify-between">
              <div>
                <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.25em] text-gold-dark block mb-2">
                  01 • Living Room
                </span>
                <h3 className="font-primary text-[30px] lg:text-[36px] font-semibold text-secondary leading-[1.08] mb-3">
                  Living Room <br />
                  <span className="text-gold">Collections</span>
                </h3>
                <p className="font-secondary text-[14px] text-secondary/70 mb-6 font-light">
                  Tailored aesthetics, enduring ergonomics, and handcrafted warmth.
                </p>
              </div>
              
              <Link href="/collections?category=Living Room">
                <button className="flex items-center gap-3 font-secondary text-[13px] font-semibold tracking-wide text-secondary group-hover:text-primary transition-all w-fit bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-secondary/10 shadow-xs group-hover:bg-white group-hover:shadow-md">
                  <span>Explore Living</span>
                  <PiArrowRightLight className="text-gold group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
            
            <div className="w-full sm:w-[45%] h-[220px] sm:h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#F5EFE7] via-transparent to-transparent z-10 pointer-events-none opacity-60" />
              {livingRoomImg && (
                <img 
                  src={livingRoomImg} 
                  alt="Living Room Collections"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
              )}
            </div>
          </motion.div>

          {/* Card 2: Kitchen & Dining */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative bg-gradient-to-br from-[#FAF6EE] to-[#EEE7D8] rounded-4xl overflow-hidden flex flex-col sm:flex-row items-center min-h-[340px] h-auto sm:h-[340px] border border-secondary/10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_45px_rgba(6,35,53,0.08)] transition-all duration-500"
          >
            <div className="relative z-10 w-full sm:w-[55%] p-8 lg:p-10 h-full flex flex-col justify-between">
              <div>
                <span className="font-secondary text-[11px] font-bold uppercase tracking-[0.25em] text-gold-dark block mb-2">
                  02 • Dining & Kitchen
                </span>
                <h3 className="font-primary text-[30px] lg:text-[36px] font-semibold text-secondary leading-[1.08] mb-3">
                  Dining <br />
                  <span className="text-gold">Essentials</span>
                </h3>
                <p className="font-secondary text-[14px] text-secondary/70 mb-6 font-light">
                  Sculptural tables and curated seating designed for everyday gatherings.
                </p>
              </div>
              
              <Link href="/collections?category=Dining Area">
                <button className="flex items-center gap-3 font-secondary text-[13px] font-semibold tracking-wide text-secondary group-hover:text-primary transition-all w-fit bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-secondary/10 shadow-xs group-hover:bg-white group-hover:shadow-md">
                  <span>Explore Dining</span>
                  <PiArrowRightLight className="text-gold group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
            
            <div className="w-full sm:w-[45%] h-[220px] sm:h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#FAF6EE] via-transparent to-transparent z-10 pointer-events-none opacity-60" />
              {kitchenImg && (
                <img 
                  src={kitchenImg} 
                  alt="Kitchen Essentials"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Collections;
