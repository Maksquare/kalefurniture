"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PiArrowRightLight, PiStarFill } from "react-icons/pi";
import VideoModal from "./VideoModal";

const Hero = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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
            <span className="font-secondary text-[11px] font-bold tracking-[0.2em] uppercase text-secondary">
              Trending Collections
            </span>
            <span className="text-gold text-lg leading-none">+</span>
          </div>

          <h1 className="font-primary text-[42px] sm:text-[52px] md:text-[64px] lg:text-[72px] font-semibold leading-[1.05] tracking-[-0.02em] text-secondary mb-6">
            Elevate Your <br />
            Space <em className="not-italic text-gold">Beautifully.</em>
          </h1>

          <p className="font-secondary text-[16px] md:text-[18px] text-secondary/70 max-w-[440px] mb-10 leading-relaxed">
            Discover stylish pieces for your home & kitchen that blend comfort, function & elegance.
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-12">
            <Link href="/collections">
              <button className="px-8 py-3.5 bg-primary text-white font-secondary text-[14px] font-medium rounded-full shadow-[0_8px_20px_rgba(155,92,53,0.3)] hover:bg-gold transition-colors hover:shadow-lg hover:-translate-y-0.5">
                Explore Collection
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
          className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center"
        >
          <div className="relative w-full h-full max-w-[500px]">
            {/* The main chair image */}
            <img 
              src="/assets/img/hero/beige-chair.jpeg" 
              alt="Cozy Beige Accent Chair"
              className="w-full h-full object-contain object-center drop-shadow-2xl mix-blend-multiply"
            />


          </div>
        </motion.div>
      </div>

      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
    </section>
  );
};

export default Hero;