"use client";


import Link from "next/link";
import { motion } from "framer-motion";
import {
  RiMapPinFill,
  RiPhoneFill,
  RiMailFill,
  RiArrowRightLine,
  RiSendPlaneFill,
  RiInstagramLine,
  RiFacebookBoxLine,
  RiTiktokLine,
  RiLinkedinLine,
} from "react-icons/ri";
import { PiStarFourFill, PiArmchairFill, PiSparkleFill } from "react-icons/pi";
import Logo from "./Logo";

/* ─── Data ───────────────────────────────────────────────────────── */
const contactItems = [
  {
    icon: RiMapPinFill,
    value: "Birchiko 40/60 Condominium, Addis Ababa",
    href:  "https://maps.app.goo.gl/HCtokEtawtrRHoSB9",
  },
  {
    icon: RiPhoneFill,
    value: "+251 936 358 805",
    href:  "tel:+251936358805",
  },
  {
    icon: RiMailFill,
    value: "info@kalfurniture.et",
    href:  "mailto:info@kalfurniture.et",
  },
];

const quickLinks = [
  { name: "Home",         to: "/" },
  { name: "Collections",  to: "/collections" },
  { name: "Packages",     to: "/packages" },
  { name: "About Us",     to: "/about" },
  { name: "Contact",      to: "/contact" },
];

const collections = [
  { name: "Living Room",   id: "living-room" },
  { name: "Bedroom",       id: "bedroom" },
  { name: "Dining Area",   id: "dining" },
  { name: "Home Office",   id: "office" },
  { name: "Outdoor Patio", id: "outdoor" },
  { name: "Decor & Accents",id: "decor" },
];

const socials = [
  { icon: RiInstagramLine,   label: "Instagram", href: "https://instagram.com" },
  { icon: RiFacebookBoxLine, label: "Facebook",  href: "https://facebook.com"  },
  { icon: RiTiktokLine,      label: "TikTok",    href: "https://www.tiktok.com/@kale11114" },
  { icon: RiLinkedinLine,    label: "LinkedIn",  href: "https://linkedin.com" },
];

/* ─── Animation variants ─────────────────────────────────────────── */
const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const animItem = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Footer ─────────────────────────────────────────────────────── */
const Footer = () => {
  return (
    <footer className="relative bg-primary overflow-hidden">
      {/* ── Background elements ───────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-gold/[0.04] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-gold/[0.03] blur-3xl pointer-events-none" />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
        className="container relative z-10"
      >
        {/* ── Main grid ─────────────────────────────────────────── */}
        <div className="py-16 xl:py-24 grid grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-x-6 gap-y-12 xl:gap-10">

          {/* Col 1 — Brand ───────────────────────────────────────── */}
          <motion.div variants={animItem} className="col-span-2 xl:col-span-1 flex flex-col items-center text-center xl:items-start xl:text-left">
            <div className="mb-6">
              <Logo isDarkText={false} />
            </div>

            <p className="font-secondary text-[13px] leading-[1.8] text-white/40 max-w-[260px] mb-8">
              Transforming houses into homes with meticulously crafted furniture. Elegance, comfort, and timeless design.
            </p>

            {/* Hours badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 border border-white/[0.08] bg-white/[0.03] mb-6">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-50" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
              </span>
              <span className="font-secondary text-[10px] font-medium tracking-[0.2em] uppercase text-white/40">
                Showroom: Mon – Sat, 9am – 8pm
              </span>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2.5">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 border border-white/[0.08] text-white/25 hover:text-gold hover:border-gold/40 transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Col 2 — Quick Links ──────────────────────────────────── */}
          <motion.div variants={animItem} className="flex flex-col items-center text-center xl:items-start xl:text-left">
            <h4 className="font-secondary text-[10px] font-medium tracking-[0.26em] uppercase text-gold/70 mb-7">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3 items-center xl:items-start">
              {quickLinks.map(({ name, to }, idx) => (
                <li key={idx} className="group flex items-center gap-2 cursor-pointer">
                  <RiArrowRightLine
                    size={11}
                    className="hidden xl:block text-gold/0 group-hover:text-gold/60 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                  />
                  <Link
                    href={to}
                    className="font-secondary text-[13px] font-medium text-white/40 hover:text-white transition-colors duration-200"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 3 — Collections ────────────────────────────────────── */}
          <motion.div variants={animItem} className="flex flex-col items-center text-center xl:items-start xl:text-left">
            <h4 className="font-secondary text-[10px] font-medium tracking-[0.26em] uppercase text-gold/70 mb-7">
              Collections
            </h4>
            <ul className="flex flex-col gap-3 items-center xl:items-start">
              {collections.map(({ name }, idx) => (
                <li
                  key={idx}
                  className="group flex items-center gap-2 cursor-pointer"
                >
                  <PiStarFourFill
                    className="hidden xl:block text-gold/0 group-hover:text-gold/50 transition-colors duration-200 text-[7px] shrink-0"
                  />
                  <Link
                    href="/collections"
                    className="font-secondary text-[13px] font-medium text-white/40 group-hover:text-white transition-colors duration-200"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Col 4 — Contact ───────────────────────────────────── */}
          <motion.div variants={animItem} className="col-span-2 xl:col-span-1 flex flex-col items-center text-center xl:items-start xl:text-left">
            <h4 className="font-secondary text-[10px] font-medium tracking-[0.26em] uppercase text-gold/70 mb-7">
              Get in Touch
            </h4>
            <p className="font-secondary text-[13px] leading-[1.8] text-white/40 mb-6 max-w-sm">
              Have questions or need assistance? Reach out to our dedicated team of interior specialists.
            </p>

            {/* Contact items */}
            <ul className="mt-2 flex flex-col gap-4 items-center xl:items-start">
              {contactItems.map(({ icon: Icon, value, href }, idx) => (
                <li key={idx} className="flex items-start gap-3 group">
                  <Icon
                    size={14}
                    className="text-gold/40 mt-0.5 shrink-0 group-hover:text-gold transition-colors duration-200"
                  />
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="font-secondary text-[12px] text-white/30 hover:text-white/70 leading-snug transition-colors duration-200"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="font-secondary text-[12px] text-white/30 leading-snug">
                      {value}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="h-px bg-gradient-to-r from-gold/15 via-white/[0.06] to-transparent" />

        {/* ── Bottom bar ────────────────────────────────────────── */}
        <motion.div
          variants={animItem}
          className="py-7 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 text-center sm:text-left"
        >
          <p className="font-secondary text-[11px] text-white/20 tracking-wide">
            &copy; {new Date().getFullYear()} Kal Furniture. All rights reserved.
          </p>

          {/* Decorative center wordmark */}
          <div className="hidden xl:flex items-center gap-3">
            <div className="h-px w-8 bg-white/[0.07]" />
            <span className="font-primary italic text-[13px] text-white/15">
              Kal
            </span>
            <div className="h-px w-8 bg-white/[0.07]" />
          </div>

          <div className="flex items-center gap-5">
            <a href="#" className="font-secondary text-[11px] text-white/20 hover:text-white/50 transition-colors duration-200 tracking-wide">
              Privacy Policy
            </a>
            <div className="w-px h-3 bg-white/[0.08]" />
            <a href="#" className="font-secondary text-[11px] text-white/20 hover:text-white/50 transition-colors duration-200 tracking-wide">
              Terms of Service
            </a>
          </div>
        </motion.div>

        {/* ── Developer Signature Bar (AME PRIME) ───────────────── */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-80" />

        <motion.div
          variants={animItem}
          className="py-4 my-4 mb-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 px-6 rounded-2xl md:rounded-full bg-white/[0.02] border border-white/[0.06] hover:border-gold/30 transition-all duration-500 backdrop-blur-md group text-center sm:text-left"
        >
          {/* Developed By AME PRIME */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gold/10 border border-gold/30 text-gold shadow-[0_0_12px_rgba(221,182,125,0.2)] group-hover:scale-110 transition-transform duration-300">
              <PiSparkleFill size={13} className="animate-pulse text-gold" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-secondary text-[10px] font-medium uppercase tracking-[0.25em] text-white/40">
                Developed By
              </span>
              <span className="text-white/20 font-light text-[12px]">—</span>
              <span className="font-primary text-[15px] font-bold tracking-[0.18em] uppercase bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(221,182,125,0.25)] group-hover:tracking-[0.22em] transition-all duration-300">
                AME PRIME
              </span>
            </div>
          </div>

          {/* Direct Phone Contact Pill */}
          <a
            href="tel:0954944389"
            aria-label="Call AME PRIME - 0954944389"
            className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-gold/50 hover:bg-gold/10 hover:shadow-[0_0_18px_rgba(221,182,125,0.2)] transition-all duration-300 text-white/60 hover:text-white"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gold/20 text-gold">
              <RiPhoneFill size={10} />
            </span>
            <span className="font-secondary text-[10px] font-medium tracking-[0.2em] uppercase text-gold/70 group-hover:text-gold transition-colors duration-200">
              Direct:
            </span>
            <span className="font-secondary text-[12px] font-semibold tracking-widest text-white/90 group-hover:text-gold transition-colors duration-200">
              0954944389
            </span>
          </a>
        </motion.div>

      </motion.div>
    </footer>
  );
};

export default Footer;