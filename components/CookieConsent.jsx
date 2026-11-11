"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiCookieLight, PiCheckBold, PiX, PiSlidersHorizontalLight, PiShieldCheckLight } from "react-icons/pi";
import { getCookieJson, setCookie } from "@/lib/cookies";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    realtimeSync: true, // Realtime sync & session cookies
    personalization: true, // Hero & promo personalization
  });

  useEffect(() => {
    // Check if consent has already been recorded in cookies
    const consent = getCookieJson("kal_cookie_consent");
    if (!consent) {
      // Delay display slightly for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = {
      essential: true,
      realtimeSync: true,
      personalization: true,
      timestamp: Date.now(),
    };
    setCookie("kal_cookie_consent", fullConsent, 365);
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    const minimalConsent = {
      essential: true,
      realtimeSync: false,
      personalization: false,
      timestamp: Date.now(),
    };
    setCookie("kal_cookie_consent", minimalConsent, 365);
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    setCookie("kal_cookie_consent", { ...preferences, timestamp: Date.now() }, 365);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed bottom-6 left-6 z-50 w-[92vw] sm:w-[420px] max-w-lg bg-[#1A1817]/95 backdrop-blur-xl border border-gold/30 rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-white"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center shrink-0 shadow-inner">
              <PiCookieLight size={22} />
            </div>
            <div>
              <h4 className="font-primary text-[17px] sm:text-[19px] font-semibold text-white tracking-wide">
                Cookie Preferences
              </h4>
              <p className="font-secondary text-[11px] text-gold/80 font-medium">
                Realtime Experience & Personalization
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="w-7 h-7 rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer"
            title="Close"
          >
            <PiX size={14} />
          </button>
        </div>

        <p className="font-secondary text-[12px] text-white/70 leading-relaxed mb-4">
          We use cookies to deliver realtime updates across your devices, remember your cart, and tailor our luxury furniture showcases to your aesthetic taste.
        </p>

        {/* Detailed Toggles when expanded */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2.5 mb-4 border-t border-white/10 pt-3 text-[12px]"
          >
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <div>
                <p className="font-semibold text-white">Essential & Security</p>
                <p className="text-[10px] text-white/50">Required for checkout & core platform security</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Always On
              </span>
            </div>

            <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <div>
                <p className="font-semibold text-white">Realtime Synchronization</p>
                <p className="text-[10px] text-white/50">Syncs cart, hero showcases & catalogs without page reloads</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.realtimeSync}
                onChange={(e) => setPreferences(p => ({ ...p, realtimeSync: e.target.checked }))}
                className="w-4 h-4 accent-gold cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <div>
                <p className="font-semibold text-white">Personalization</p>
                <p className="text-[10px] text-white/50">Curates featured products and hero spotlight collections</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.personalization}
                onChange={(e) => setPreferences(p => ({ ...p, personalization: e.target.checked }))}
                className="w-4 h-4 accent-gold cursor-pointer"
              />
            </label>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          {showDetails ? (
            <button
              type="button"
              onClick={handleSaveCustom}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-full bg-gold hover:bg-gold-dark text-primary font-secondary text-[12px] font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              Save Preferences
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-full bg-gold hover:bg-gold-dark text-primary font-secondary text-[12px] font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleAcceptEssential}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/15 text-white/90 font-secondary text-[12px] font-semibold transition-colors"
              >
                Essential Only
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-white/50 hover:text-gold transition-colors text-[11px] font-secondary underline underline-offset-2 flex items-center gap-1"
          >
            <PiSlidersHorizontalLight size={14} />
            {showDetails ? "Simple View" : "Customize"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
