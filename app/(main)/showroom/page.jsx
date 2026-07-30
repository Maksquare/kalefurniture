"use client";

import { motion } from "framer-motion";
import { PiMapPinLight, PiCalendarCheckLight, PiClockLight } from "react-icons/pi";
import ShowroomSlider from "@/components/ShowroomSlider";

export default function ShowroomPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 bg-transparent">
      {/* Hero Intro */}
      <section className="container mb-16 md:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-gold/60" />
            <span className="font-secondary text-[11px] font-medium tracking-[0.28em] uppercase text-gold">
              Visit Us
            </span>
          </div>
          <h1 className="font-primary text-[42px] md:text-[64px] lg:text-[80px] text-secondary leading-[1.05] mb-6">
            Experience Our <br />
            <span className="text-gold italic font-light">Showroom</span>
          </h1>
          <p className="font-secondary text-[16px] md:text-[18px] text-secondary/70 leading-relaxed max-w-2xl">
            Immerse yourself in our meticulously curated spaces. From grand living rooms to serene bedroom sanctuaries, discover the craftsmanship and quality of Kal Furniture in person.
          </p>
        </motion.div>
      </section>

      {/* The Immersive Slider */}
      <section className="mb-20 md:mb-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <ShowroomSlider />
        </motion.div>
      </section>

      {/* Visit Details */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Item 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col p-8 border border-secondary/10 bg-white/40 rounded-2xl hover:bg-white/60 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-6">
              <PiMapPinLight className="text-2xl text-gold" />
            </div>
            <h3 className="font-primary text-2xl text-secondary mb-3">Location</h3>
            <p className="font-secondary text-sm text-secondary/70 leading-relaxed mb-6">
              Bole Medhanialem <br />
              Addis Ababa, Ethiopia
            </p>
            <a 
              href="https://maps.google.com/?q=Addis+Ababa" 
              target="_blank" 
              rel="noreferrer"
              className="mt-auto inline-flex font-secondary text-[11px] font-bold tracking-[0.2em] uppercase text-gold hover:text-secondary transition-colors"
            >
              Get Directions &rarr;
            </a>
          </motion.div>

          {/* Item 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col p-8 border border-secondary/10 bg-white/40 rounded-2xl hover:bg-white/60 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-6">
              <PiClockLight className="text-2xl text-gold" />
            </div>
            <h3 className="font-primary text-2xl text-secondary mb-3">Hours</h3>
            <ul className="font-secondary text-sm text-secondary/70 leading-loose">
              <li className="flex justify-between"><span>Mon - Fri</span> <span>10:00 AM - 7:00 PM</span></li>
              <li className="flex justify-between"><span>Saturday</span> <span>11:00 AM - 6:00 PM</span></li>
              <li className="flex justify-between"><span>Sunday</span> <span className="text-secondary/40">Closed</span></li>
            </ul>
          </motion.div>

          {/* Item 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col p-8 border border-secondary/10 bg-white/40 rounded-2xl bg-gradient-to-br from-gold/10 to-transparent relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-6">
                <PiCalendarCheckLight className="text-2xl text-gold" />
              </div>
              <h3 className="font-primary text-2xl text-secondary mb-3">VIP Consultation</h3>
              <p className="font-secondary text-sm text-secondary/70 leading-relaxed mb-6">
                Schedule a one-on-one guided tour with our interior design experts.
              </p>
              <a 
                href="https://wa.me/251911123456?text=Hello%2C%20I%20would%20like%20to%20book%20a%20VIP%20Showroom%20Consultation." 
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center px-6 py-3 bg-gold hover:bg-gold-light text-primary font-secondary text-[11px] font-bold tracking-[0.2em] uppercase transition-colors rounded-sm shadow-[0_4px_20px_rgba(201,168,76,0.3)] hover:shadow-[0_4px_30px_rgba(201,168,76,0.5)]"
              >
                Book via WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
