/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "960px",
      xl: "1200px",
    },
    fontFamily: {
      primary: ["var(--font-cormorant)"],    // Elegant serif for headings
      secondary: ["var(--font-jost)"],        // Clean geometric sans for body
      accent: ["var(--font-italiana)"],       // Decorative for special labels
    },
    container: {
      center: true,
      padding: "15px",
    },
    extend: {
      colors: {
        // ── Core Brand ──────────────────────────────────────────────
        primary:    "#062335", // Deep Navy
        muted:      "#0A314A",

        // ── Gold Palette (Mapped to Rust/Brown for compatibility) ────
        gold:       "#ddb67d",
        "gold-light": "#E8CC90",
        "gold-dark":  "#C89F5C",

        // ── Neutral / Surface ────────────────────────────────────────
        porcelain:  "#FFFFFF",
        cream:      "#FDFBF7",
        ivory:      "#F7F4EE",

        // ── Text ─────────────────────────────────────────────────────
        secondary:  "#062335",
        subtle:     "#5A6E7D",

        // ── UI ───────────────────────────────────────────────────────
        border:     "#E5E0D8",
        surface:    "#FDFBF7",

        // ── Functional ───────────────────────────────────────────────
        success:    "#2A7A4B",
        error:      "#B83232",
      },

      backgroundImage: {
        // Subtle gold shimmer gradient
        "gold-shimmer": "linear-gradient(135deg, #D9B66E 0%, #E8CC90 50%, #D9B66E 100%)",
        // Deep charcoal gradient
        "navy-gradient": "linear-gradient(135deg, #191816 0%, #2A2825 100%)",
        // Porcelain light gradient
        "porcelain-gradient": "linear-gradient(180deg, #EBE4D5 0%, #F4EFEB 100%)",
        // Hero overlay
        "hero-overlay": "linear-gradient(135deg, rgba(25,24,22,0.92) 0%, rgba(42,40,37,0.80) 100%)",
        // Subtle grain texture via CSS (applied via pseudo)
        hero: "url('/assets/hero-bg.png')",
      },

      boxShadow: {
        // Soft lift — cards
        "card":         "0 4px 32px rgba(25, 24, 22, 0.04)",
        // Elevated — modals, dropdowns
        "elevated":     "0 8px 48px rgba(25, 24, 22, 0.08)",
        // Gold glow — CTA buttons, highlighted elements
        "gold-glow":    "0 4px 24px rgba(217, 182, 110, 0.35)",
        // Inset for inputs
        "input":        "inset 0 2px 6px rgba(25, 24, 22, 0.03)",
        // Deep shadow for hero elements
        "deep":         "0 16px 64px rgba(25, 24, 22, 0.20)",
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "section": "7rem",
      },

      letterSpacing: {
        "widest-xl": "0.25em",
        "widest-2xl": "0.35em",
      },

      transitionTimingFunction: {
        "luxury": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "bounce-soft": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      animation: {
        "fade-up":      "fadeUp 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        "fade-in":      "fadeIn 0.6s ease both",
        "shimmer":      "shimmer 2.5s linear infinite",
        "float":        "float 6s ease-in-out infinite",
        "pulse-gold":   "pulseGold 2s ease-in-out infinite",
      },

      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(217,182,110,0.4)" },
          "50%":      { boxShadow: "0 0 0 12px rgba(217,182,110,0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};