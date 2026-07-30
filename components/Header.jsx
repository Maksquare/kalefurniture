"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PiMagnifyingGlassLight,
  PiShoppingCartSimpleLight
} from "react-icons/pi";
import Logo from "./Logo";
import NavMobile from "./NavMobile";
import { useCart } from "@/context/CartContext";
import SearchModal from "./SearchModal";

const links = [
  { name: "Home",        href: "/" },
  { name: "Collections", href: "/collections" },
  { name: "Packages",    href: "/packages" },
  { name: "About",       href: "/about" },
  { name: "Contact",     href: "/contact" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  
  const { scrollY } = useScroll();

  useEffect(() => { setMounted(true); }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  return (
    <div className="fixed left-0 right-0 z-50 transition-all duration-300">
      <header
        className={`w-full transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container flex items-center justify-between">
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-6">
              {links.map(({ name, href }) => {
                const isActive = pathname === href || (href === "/collections" && pathname.startsWith("/collections") && name !== "Home");
                return (
                  <li key={name}>
                    <Link
                      href={href}
                      className={`font-secondary text-[14px] font-medium transition-colors hover:text-gold ${
                        isActive ? "text-secondary font-semibold" : "text-secondary/70"
                      }`}
                    >
                      {name}
                      {isActive && (
                        <div className="h-[2px] w-full bg-secondary mt-1" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            {/* Search & Cart - Visible everywhere */}
            <div className="flex items-center gap-4 text-secondary/80 mr-1 lg:mr-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search" 
                className="hover:text-gold transition-colors"
              >
                <PiMagnifyingGlassLight size={22} />
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                aria-label="Open Cart"
                className="relative hover:text-gold transition-colors"
              >
                <PiShoppingCartSimpleLight size={22} />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-gold rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* Desktop-only button */}
            <div className="hidden lg:block">
              <Link href="/showroom">
                <button className="px-6 py-2.5 bg-primary text-white font-secondary text-[14px] font-medium rounded-full hover:bg-gold transition-colors shadow-md">
                  Visit Us
                </button>
              </Link>
            </div>

            {/* Mobile Nav Hamburger */}
            <div className="lg:hidden">
              <NavMobile isDarkText={true} />
            </div>
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default Header;