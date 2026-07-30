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
import { PiStarFourFill, PiArmchairFill } from "react-icons/pi";
import Logo from "./Logo";

/* ─── Data ───────────────────────────────────────────────────────── */
const contactItems = [
  {
    icon: RiMapPinFill,
    value: "Bole Medhanialem, Addis Ababa, Ethiopia",
    href:  "https://maps.google.com/?q=Addis+Ababa",
  },
  {
    icon: RiPhoneFill,
    value: "+251 911 123 456",
    href:  "tel:+251911123456",
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
        <div className="py-16 xl:py-24 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-12 xl:gap-10">

          {/* Col 1 — Brand ───────────────────────────────────────── */}
          <motion.div variants={animItem} className="xl:col-span-1">
            <div className="mb-6">
              <Logo isDarkText={false} />
            </div>

            <p className="font-secondary text-[13px] leading-[1.8] text-white/40 max-w-[230px] mb-8">
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
          <motion.div variants={animItem}>
            <h4 className="font-secondary text-[10px] font-medium tracking-[0.26em] uppercase text-gold/70 mb-7">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3">
              {quickLinks.map(({ name, to }, idx) => (
                <li key={idx} className="group flex items-center gap-2 cursor-pointer">
                  <RiArrowRightLine
                    size={11}
                    className="text-gold/0 group-hover:text-gold/60 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
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
          <motion.div variants={animItem}>
            <h4 className="font-secondary text-[10px] font-medium tracking-[0.26em] uppercase text-gold/70 mb-7">
              Collections
            </h4>
            <ul className="flex flex-col gap-3">
              {collections.map(({ name }, idx) => (
                <li
                  key={idx}
                  className="group flex items-center gap-2 cursor-pointer"
                >
                  <PiStarFourFill
                    className="text-gold/0 group-hover:text-gold/50 transition-colors duration-200 text-[7px] shrink-0"
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
          <motion.div variants={animItem}>
            <h4 className="font-secondary text-[10px] font-medium tracking-[0.26em] uppercase text-gold/70 mb-7">
              Get in Touch
            </h4>
            <p className="font-secondary text-[13px] leading-[1.8] text-white/40 mb-6">
              Have questions or need assistance? Reach out to our dedicated team of interior specialists.
            </p>

            {/* Contact items */}
            <ul className="mt-2 flex flex-col gap-4">
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
          className="py-7 flex flex-col sm:flex-row items-center justify-between gap-4"
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

      </motion.div>
    </footer>
  );
};

export default Footer;