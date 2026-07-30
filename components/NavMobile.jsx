"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  RiMenu3Fill, 
  RiCloseLine, 
  RiInstagramLine, 
  RiFacebookBoxLine, 
  RiLinkedinLine 
} from "react-icons/ri";
import { PiArmchairFill } from "react-icons/pi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const links = [
  { name: "Home",        href: "/",            number: "01" },
  { name: "Collections", href: "/collections", number: "02" },
  { name: "Showroom",    href: "/showroom",    number: "03" },
  { name: "About Us",    href: "/about",       number: "04" },
  { name: "Contact",     href: "/contact",     number: "05" },
];

const NavMobile = ({ isDarkText = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* ── Trigger ── */}
      <SheetTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className={`group flex items-center justify-center w-11 h-11 rounded-full transition-all duration-500 ease-luxury ${
            isDarkText 
              ? 'bg-secondary/5 text-secondary hover:bg-gold hover:text-white' 
              : 'bg-white/5 backdrop-blur-md border border-white/10 text-white hover:border-gold hover:bg-gold/20 hover:text-gold'
          }`}
          aria-label="Open navigation menu"
        >
          <RiMenu3Fill className="text-xl transition-transform duration-500 ease-luxury group-hover:rotate-180" />
        </motion.button>
      </SheetTrigger>

      {/* ── Drawer panel ── */}
      <SheetContent
        side="right"
        className="w-full sm:w-[440px] bg-primary/95 backdrop-blur-3xl border-l border-white/[0.05] p-0 flex flex-col [&>button]:hidden shadow-2xl"
      >
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Subtle Armchair Watermark */}
        <PiArmchairFill className="absolute -bottom-16 -right-16 text-[320px] text-white/[0.015] -rotate-12 pointer-events-none" />

        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Site navigation links</SheetDescription>
        </SheetHeader>

        <div className="relative flex flex-col h-full px-10 py-12 z-10">
          
          {/* ── Header row ── */}
          <div className="flex items-center justify-between mb-16">
            <div className="scale-90 origin-left">
              <Logo isDarkText={false} />
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setIsOpen(false)}
              className="group flex items-center justify-center w-11 h-11 rounded-full
                         border border-white/10 bg-white/5 text-white/50
                         hover:border-gold hover:text-gold hover:bg-gold/10
                         transition-all duration-500 ease-luxury"
              aria-label="Close navigation menu"
            >
              <RiCloseLine className="text-2xl transition-transform duration-500 ease-luxury group-hover:rotate-90" />
            </motion.button>
          </div>

          {/* ── Nav links ── */}
          <ul className="flex flex-col gap-7 flex-1">
            {links.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 40 }}
                  animate={isOpen ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.7,
                    delay: 0.1 + index * 0.08,
                    ease: [0.25, 0.46, 0.45, 0.94], // luxury ease
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="cursor-pointer group flex items-start gap-4 py-1"
                  >
                    {/* Index Number */}
                    <span className="font-secondary text-[11px] text-gold/50 tracking-[0.2em] mt-3 font-medium
                                     group-hover:text-gold transition-colors duration-500 ease-luxury">
                      {link.number}
                    </span>
                    
                    {/* Link Text & Underline */}
                    <div className="relative overflow-hidden pb-1 pr-6">
                      <span className={[
                        "font-primary text-4xl sm:text-5xl tracking-wide transition-all duration-700 ease-luxury block transform group-hover:translate-x-3",
                        isActive ? "text-gold italic" : "text-white/80 group-hover:text-white group-hover:italic"
                      ].join(" ")}>
                        {link.name}
                      </span>
                      {/* Animated underline */}
                      <span className={[
                        "absolute bottom-1 left-0 w-full h-[1px] bg-gold transform origin-left transition-transform duration-700 ease-luxury",
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      ].join(" ")} />
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>

          {/* ── Footer Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isOpen ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-auto pt-10"
          >
            {/* Elegant fading divider */}
            <div className="h-px w-full bg-gradient-to-r from-white/20 via-white/5 to-transparent mb-8" />
            
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-2.5">
                <p className="font-secondary text-[10px] font-semibold tracking-[0.25em] uppercase text-gold">
                  Contact Studio
                </p>
                <a href="mailto:info@kalfurniture.et" className="font-secondary text-[13px] tracking-wide text-white/60 hover:text-white transition-colors duration-300">
                  info@kalfurniture.et
                </a>
                <a href="tel:+251911123456" className="font-secondary text-[13px] tracking-wide text-white/60 hover:text-white transition-colors duration-300">
                  +251 911 123 456
                </a>
              </div>
              
              {/* Socials */}
              <div className="flex gap-4">
                <a href="#" aria-label="Instagram" className="text-white/40 hover:text-gold transition-colors duration-300">
                  <RiInstagramLine className="text-xl" />
                </a>
                <a href="#" aria-label="Facebook" className="text-white/40 hover:text-gold transition-colors duration-300">
                  <RiFacebookBoxLine className="text-xl" />
                </a>
                <a href="#" aria-label="LinkedIn" className="text-white/40 hover:text-gold transition-colors duration-300">
                  <RiLinkedinLine className="text-xl" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavMobile;