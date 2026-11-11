"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PiMagnifyingGlassLight,
  PiShoppingCartSimpleLight
} from "react-icons/pi";
import Logo from "./Logo";
import NavMobile from "./NavMobile";
import { useCart } from "@/context/CartContext";
import { useHeroTheme } from "@/context/HeroThemeContext";
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
  const [isDarkArea, setIsDarkArea] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();

  // Safely read hero theme if available
  let heroTheme = null;
  try {
    const heroThemeCtx = useHeroTheme?.();
    heroTheme = heroThemeCtx?.heroTheme;
  } catch (e) {
    // Graceful fallback outside provider
  }

  // Smart scroll & dark-area contrast detection
  const checkContrastAndScroll = useCallback(() => {
    if (typeof window === "undefined") return;

    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const isNowScrolled = scrollY > 20;
    setScrolled(isNowScrolled);

    let darkDetected = false;
    const headerHeight = 75;

    // 1. Explicit check: Footer overlap
    const footer = document.querySelector('footer');
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      if (footerRect.top <= headerHeight && footerRect.bottom >= 0) {
        darkDetected = true;
      }
    }

    // 2. Explicit check: Elements marked with data-header-theme="dark" or dark classes
    if (!darkDetected) {
      const darkSections = document.querySelectorAll(
        '[data-header-theme="dark"], [data-theme="dark"], .bg-primary, .dark-section'
      );
      for (const section of darkSections) {
        if (section.closest('header') || section.closest('#cart-drawer') || section.closest('#search-modal')) {
          continue;
        }
        const rect = section.getBoundingClientRect();
        if (rect.top <= headerHeight && rect.bottom >= 20) {
          darkDetected = true;
          break;
        }
      }
    }

    // 3. Dynamic Point-sampling check: Sample background luminance of element directly under header
    if (!darkDetected && typeof document.elementsFromPoint === "function") {
      const samplePoints = [
        [window.innerWidth / 2, 40],
        [Math.min(window.innerWidth * 0.25, 200), 40],
        [Math.max(window.innerWidth * 0.75, window.innerWidth - 200), 40],
      ];

      for (const [x, y] of samplePoints) {
        const elements = document.elementsFromPoint(x, y);
        for (const el of elements) {
          if (
            el.closest('header') ||
            el.id === 'cart-drawer' ||
            el.id === 'search-modal'
          ) {
            continue;
          }
          if (el.closest('footer') || el.closest('[data-header-theme="dark"]')) {
            darkDetected = true;
            break;
          }

          const style = window.getComputedStyle(el);
          const bg = style.backgroundColor;
          if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
            const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
              const r = parseInt(match[1], 10);
              const g = parseInt(match[2], 10);
              const b = parseInt(match[3], 10);
              const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
              if (lum < 0.45) {
                darkDetected = true;
              }
            }
            break; // Found topmost non-transparent background
          }
        }
        if (darkDetected) break;
      }
    }

    // 4. Hero section initial check when not scrolled
    if (!isNowScrolled && heroTheme?.textColor === "light") {
      darkDetected = true;
    }

    setIsDarkArea(darkDetected);
  }, [heroTheme]);

  useEffect(() => {
    setMounted(true);

    let ticking = false;
    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkContrastAndScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Run immediately on mount and after a short paint delay
    checkContrastAndScroll();
    const timer = setTimeout(checkContrastAndScroll, 100);

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [checkContrastAndScroll, pathname]);

  return (
    <div className="fixed left-0 right-0 z-50 transition-all duration-500">
      <header
        className={`w-full transition-all duration-500 ${
          scrolled
            ? isDarkArea
              ? 'backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-b border-white/10 py-3.5'
              : 'backdrop-blur-xl shadow-[0_4px_24px_rgba(6,35,53,0.06)] border-b border-secondary/10 py-3.5'
            : 'bg-transparent py-5'
        }`}
        style={{
          backgroundColor: scrolled
            ? isDarkArea
              ? "rgba(6, 35, 53, 0.94)"
              : "rgba(253, 251, 247, 0.92)"
            : "transparent"
        }}
      >
        <div className="container flex items-center justify-between">
          <Logo isDarkArea={isDarkArea} />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <ul
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-300 backdrop-blur-md ${
                isDarkArea
                  ? 'bg-white/[0.08] border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
                  : 'bg-secondary/[0.04] border border-secondary/[0.08] shadow-sm'
              }`}
            >
              {links.map(({ name, href }) => {
                const isActive =
                  pathname === href ||
                  (href === "/collections" && pathname.startsWith("/collections") && name !== "Home");
                return (
                  <li key={name} className="relative">
                    <Link
                      href={href}
                      className={`relative px-4 py-2 rounded-full font-secondary text-[13px] font-medium transition-all duration-300 block ${
                        isActive
                          ? "text-primary font-semibold"
                          : isDarkArea
                            ? "text-white/85 hover:text-white hover:bg-white/10"
                            : "text-secondary/70 hover:text-primary hover:bg-secondary/[0.04]"
                      }`}
                    >
                      {name}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className={`absolute inset-0 rounded-full -z-10 shadow-sm transition-colors duration-300 ${
                            isDarkArea
                              ? "bg-gradient-to-r from-gold via-gold-light to-gold shadow-[0_2px_14px_rgba(217,182,110,0.45)]"
                              : "bg-white border border-secondary/10 shadow-sm"
                          }`}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {/* Search & Cart */}
            <div className={`flex items-center gap-2 transition-colors duration-300 ${
              isDarkArea ? 'text-white/90' : 'text-secondary/80'
            }`}>
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${
                  isDarkArea
                    ? 'text-white/90 hover:bg-white/10 hover:text-gold'
                    : 'text-secondary/80 hover:bg-secondary/5 hover:text-gold'
                }`}
              >
                <PiMagnifyingGlassLight size={21} />
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Open Cart"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative active:scale-95 group ${
                  isDarkArea
                    ? 'text-white/90 hover:bg-white/10 hover:text-gold'
                    : 'text-secondary/80 hover:bg-secondary/5 hover:text-gold'
                }`}
              >
                <PiShoppingCartSimpleLight size={21} />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-tr from-gold to-gold-light text-primary text-[9px] font-bold items-center justify-center shadow-sm">
                      {cartCount}
                    </span>
                  </span>
                )}
              </button>
            </div>

            {/* Desktop-only button */}
            <div className="hidden lg:block ml-2">
              <Link href="/showroom">
                <button
                  className={`px-5 py-2.5 font-secondary text-[13px] font-semibold tracking-wide rounded-full transition-all duration-300 active:scale-95 ${
                    isDarkArea
                      ? 'bg-gradient-to-r from-gold via-gold-light to-gold text-primary hover:bg-white hover:text-primary shadow-[0_4px_20px_rgba(217,182,110,0.35)]'
                      : 'bg-primary text-white hover:bg-gold hover:text-primary hover:shadow-[0_8px_20px_rgba(217,182,110,0.3)]'
                  }`}
                >
                  Visit Showroom
                </button>
              </Link>
            </div>

            {/* Mobile Nav Hamburger */}
            <div className="lg:hidden">
              <NavMobile isDarkText={!isDarkArea} />
            </div>
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default Header;