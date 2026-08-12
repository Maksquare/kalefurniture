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
  RiMenu4Line, 
  RiCloseLine, 
  RiInstagramLine, 
  RiFacebookBoxLine, 
  RiTiktokLine,
  RiLinkedinLine,
  RiPhoneFill,
  RiMapPinFill,
  RiArrowRightUpLine
} from "react-icons/ri";
import { PiStarFourFill, PiArmchairFill, PiSparkleFill } from "react-icons/pi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const links = [
  { name: "Home",        href: "/",            number: "01" },
  { name: "Collections", href: "/collections", number: "02" },
  { name: "Packages",    href: "/packages",    number: "03" },
  { name: "Showroom",    href: "/showroom",    number: "04" },
  { name: "About Us",    href: "/about",       number: "05" },
  { name: "Contact",     href: "/contact",     number: "06" },
];

const categoryShortcuts = [
  { name: "Living Room",   href: "/collections" },
  { name: "Bedroom",       href: "/collections" },
  { name: "Dining Area",   href: "/collections" },
  { name: "Home Office",   href: "/collections" },
];

const NavMobile = ({ isDarkText = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* ── Luxury Menu Trigger Button ── */}
      <SheetTrigger asChild>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(true)}
          className={`group relative inline-flex items-center gap-2.5 px-4 py-2 rounded-full transition-all duration-500 ${
            isDarkText 
              ? 'bg-secondary/5 border border-secondary/10 text-secondary hover:bg-primary hover:text-white hover:border-primary shadow-sm' 
              : 'bg-white/10 backdrop-blur-md border border-white/15 text-white hover:border-gold hover:bg-gold/20 hover:text-gold shadow-lg'
          }`}
          aria-label="Open luxury navigation menu"
        >
          <RiMenu4Line className="text-lg transition-transform duration-500 ease-luxury group-hover:rotate-180 text-gold" />
          <span className="font-secondary text-[11px] font-semibold tracking-[0.2em] uppercase">
            Menu
          </span>
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
          </span>
        </motion.button>
      </SheetTrigger>

      {/* ── Full Screen Luxury Drawer Panel ── */}
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] bg-[#041926]/98 backdrop-blur-3xl border-l border-white/[0.08] p-0 flex flex-col [&>button]:hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-y-auto"
      >
        {/* Background Ambient Glows & Watermarks */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-96 h-96 bg-[#062335] rounded-full blur-[140px] pointer-events-none" />
        
        {/* Noise Grain */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Armchair Luxury Watermark */}
        <PiArmchairFill className="absolute -bottom-10 -right-10 text-[340px] text-white/[0.015] -rotate-12 pointer-events-none" />

        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Site navigation links</SheetDescription>
        </SheetHeader>

        <div className="relative flex flex-col min-h-full px-8 sm:px-10 py-10 z-10 justify-between">
          
          {/* ── Top Header Row ── */}
          <div>
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.08]">
              <div className="scale-90 origin-left">
                <Logo isDarkText={false} />
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-center w-11 h-11 rounded-full
                           border border-gold/30 bg-gold/10 text-gold
                           hover:border-gold hover:text-white hover:bg-gold/30
                           transition-all duration-500 ease-luxury shadow-[0_0_15px_rgba(221,182,125,0.15)]"
                aria-label="Close navigation menu"
              >
                <RiCloseLine className="text-2xl transition-transform duration-500 ease-luxury group-hover:rotate-90" />
              </motion.button>
            </div>

            {/* ── Navigation Links ── */}
            <ul className="flex flex-col gap-4 mb-8">
              {links.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    animate={isOpen ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.6,
                      delay: 0.08 + index * 0.05,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="cursor-pointer group flex items-center justify-between py-2 border-b border-white/[0.04] hover:border-gold/30 transition-colors duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-secondary text-[10px] text-gold/60 tracking-[0.2em] font-medium group-hover:text-gold transition-colors duration-300">
                          {link.number}
                        </span>
                        <span className={[
                          "font-primary text-3xl sm:text-4xl tracking-wide transition-all duration-500 block",
                          isActive ? "text-gold italic font-semibold translate-x-2" : "text-white/80 group-hover:text-white group-hover:italic group-hover:translate-x-2"
                        ].join(" ")}>
                          {link.name}
                        </span>
                      </div>
                      
                      {/* Chevron / Active Indicator Badge */}
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/40 font-secondary text-[9px] uppercase tracking-widest text-gold font-semibold">
                            Active
                          </span>
                        ) : (
                          <RiArrowRightUpLine className="text-white/20 text-xl group-hover:text-gold group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                        )}
                      </div>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>

            {/* ── Category Quick Links ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isOpen ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-secondary text-[10px] font-semibold tracking-[0.25em] uppercase text-gold/80 flex items-center gap-1.5">
                  <PiStarFourFill size={10} className="text-gold" /> Collections Suite
                </span>
                <span className="font-secondary text-[9px] text-white/30 uppercase tracking-wider">
                  Quick Access
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categoryShortcuts.map((cat, i) => (
                  <Link
                    key={i}
                    href={cat.href}
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-gold/15 border border-white/[0.05] hover:border-gold/30 text-white/70 hover:text-gold font-secondary text-[12px] font-medium transition-all duration-300 flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-gold/50">→</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Studio Contact & Developer Footer ── */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={isOpen ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="pt-4 border-t border-white/[0.08]"
          >
            {/* Showroom & Call strip */}
            <div className="flex flex-col gap-2.5 mb-6">
              <a
                href="tel:+251936358805"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gold/10 border border-gold/30 text-white hover:border-gold hover:bg-gold/20 transition-all duration-300 group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold/20 text-gold">
                    <RiPhoneFill size={12} />
                  </span>
                  <span className="font-secondary text-[12px] font-semibold text-white/90 group-hover:text-gold transition-colors">
                    +251 936 358 805
                  </span>
                </div>
                <span className="font-secondary text-[9px] font-semibold tracking-wider uppercase text-gold">
                  Call Showroom
                </span>
              </a>

              <div className="flex items-center gap-2 px-1 text-white/40 font-secondary text-[11px]">
                <RiMapPinFill size={12} className="text-gold/60 shrink-0" />
                <span className="truncate">Birchiko 40/60 Condominium, Addis Ababa</span>
              </div>
            </div>

            {/* Social Icons & Signature */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
              <div className="flex gap-2">
                {[
                  { icon: RiInstagramLine, href: "https://instagram.com" },
                  { icon: RiFacebookBoxLine, href: "https://facebook.com" },
                  { icon: RiTiktokLine, href: "https://www.tiktok.com/@kale11114" },
                  { icon: RiLinkedinLine, href: "https://linkedin.com" },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/40 hover:bg-gold/10 transition-all duration-300"
                    >
                      <Icon className="text-sm" />
                    </a>
                  );
                })}
              </div>

              {/* Developer Badge */}
              <a
                href="tel:0954944389"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-gold/40 hover:bg-gold/10 transition-all duration-300 group"
              >
                <PiSparkleFill size={10} className="text-gold animate-pulse" />
                <span className="font-secondary text-[9px] text-white/40 uppercase tracking-wider">
                  AME PRIME
                </span>
                <span className="font-secondary text-[9px] font-semibold text-gold/80 group-hover:text-gold">
                  0954944389
                </span>
              </a>
            </div>
          </motion.div>

        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavMobile;