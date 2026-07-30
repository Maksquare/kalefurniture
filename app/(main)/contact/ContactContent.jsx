"use client";

import { motion } from "framer-motion";
import { 
  RiMapPinLine, 
  RiPhoneLine, 
  RiMailSendLine, 
  RiInstagramLine, 
  RiFacebookBoxLine, 
  RiTiktokLine,
  RiLinkedinLine,
  RiWhatsappLine
} from "react-icons/ri";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const socials = [
  { icon: RiInstagramLine, label: "Instagram", href: "#" },
  { icon: RiFacebookBoxLine, label: "Facebook", href: "#" },
  { icon: RiTiktokLine, label: "TikTok", href: "https://www.tiktok.com/@kale11114" },
  { icon: RiLinkedinLine, label: "LinkedIn", href: "#" },
];

export default function ContactContent() {
  return (
    <div className="overflow-hidden min-h-screen bg-transparent relative">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <main className="pt-32 pb-24 xl:pt-40 xl:pb-32 container relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-gold/60" />
            <span className="font-secondary text-[11px] font-medium tracking-[0.28em] uppercase text-gold">
              Get In Touch
            </span>
            <div className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="font-primary text-[48px] md:text-[72px] font-light text-secondary leading-[1.05] tracking-tight mb-8">
            Contact <em className="text-gold not-italic font-semibold">Us.</em>
          </h1>
          <p className="font-secondary text-[16px] md:text-[18px] text-secondary/70 leading-relaxed max-w-2xl mx-auto">
            Get in touch with our team. Whether you are looking to furnish an entire estate or seeking that one perfect statement piece, our design consultants are here to guide your vision.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto"
        >
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Location Card */}
            <motion.div variants={itemVariants} className="group relative bg-white/40 border border-secondary/10 p-8 rounded-2xl overflow-hidden hover:bg-white/60 hover:border-gold/30 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/15 transition-colors duration-500" />
              <div className="relative z-10 flex items-start gap-5">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <RiMapPinLine className="text-gold text-2xl" />
                </div>
                <div>
                  <h3 className="font-primary text-[22px] text-secondary mb-2">Showroom</h3>
                  <p className="font-secondary text-[14px] leading-loose text-secondary/70 mb-4">
                    Bole Medhanialem, Next to Edna Mall<br />
                    Addis Ababa, Ethiopia
                  </p>
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="inline-flex font-secondary text-[11px] font-bold tracking-[0.2em] uppercase text-gold hover:text-secondary transition-colors">
                    Get Directions &rarr;
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Phone Card */}
            <motion.div variants={itemVariants} className="group relative bg-white/40 border border-secondary/10 p-8 rounded-2xl overflow-hidden hover:bg-white/60 hover:border-gold/30 transition-all duration-500">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/15 transition-colors duration-500" />
              <div className="relative z-10 flex items-start gap-5">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <RiPhoneLine className="text-gold text-2xl" />
                </div>
                <div>
                  <h3 className="font-primary text-[22px] text-secondary mb-2">Direct Line</h3>
                  <a href="tel:+251911123456" className="block font-secondary text-[16px] text-secondary/80 hover:text-gold transition-colors mb-1">+251 911 123 456</a>
                  <p className="font-secondary text-[13px] text-secondary/50">Mon – Sat, 9am – 8pm</p>
                </div>
              </div>
            </motion.div>

            {/* Email Card */}
            <motion.div variants={itemVariants} className="group relative bg-white/40 border border-secondary/10 p-8 rounded-2xl overflow-hidden hover:bg-white/60 hover:border-gold/30 transition-all duration-500">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/15 transition-colors duration-500" />
              <div className="relative z-10 flex items-start gap-5">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <RiMailSendLine className="text-gold text-2xl" />
                </div>
                <div>
                  <h3 className="font-primary text-[22px] text-secondary mb-2">Email</h3>
                  <a href="mailto:info@kalfurniture.et" className="block font-secondary text-[16px] text-secondary/80 hover:text-gold transition-colors">info@kalfurniture.et</a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual & Socials */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <motion.div variants={itemVariants} className="relative w-full h-[400px] lg:h-[calc(100%-110px)] rounded-2xl overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop" 
                alt="Showroom Interior" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="font-primary text-[28px] text-white mb-2">Book a Visit</h3>
                <p className="font-secondary text-white/70 text-[14px] mb-6 max-w-sm">Explore our curated collections in person and feel the unparalleled quality of our craftsmanship.</p>
                <a 
                  href="https://wa.me/251911123456?text=Hello%2C%20I%20would%20like%20to%20book%20a%20VIP%20Showroom%20Consultation." 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-gold backdrop-blur-md border border-white/20 hover:border-gold text-white hover:text-primary font-secondary text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-sm"
                >
                  <RiWhatsappLine size={16} /> Book via WhatsApp
                </a>
              </div>
            </motion.div>

            {/* Socials Banner */}
            <motion.div variants={itemVariants} className="bg-secondary text-surface p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0 h-[110px]">
              <div>
                <h3 className="font-primary text-[20px] text-white mb-1">Follow Our Journey</h3>
                <p className="font-secondary text-[13px] text-white/50">Discover our latest collections.</p>
              </div>
              <div className="flex items-center gap-4">
                {socials.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a 
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/70 hover:text-primary hover:bg-gold hover:border-gold transition-all duration-300"
                    >
                      <Icon size={20} />
                    </a>
                  )
                })}
              </div>
            </motion.div>
          </div>

        </motion.div>

        {/* Map Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 lg:mt-12 w-full max-w-6xl mx-auto h-[350px] md:h-[450px] rounded-2xl overflow-hidden border border-secondary/10 relative z-10"
        >
          <iframe 
            src="https://maps.google.com/maps?q=Edna%20Mall,%20Bole,%20Addis%20Ababa,%20Ethiopia&t=&z=15&ie=UTF8&iwloc=&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full grayscale-[30%] contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
          ></iframe>
        </motion.div>
      </main>
    </div>
  );
}
