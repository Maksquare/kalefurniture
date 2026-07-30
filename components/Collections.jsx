"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PiArrowRightLight } from "react-icons/pi";
import { useProducts } from "@/context/ProductContext";

const Collections = () => {
  const { products, isLoaded } = useProducts();

  // Get all featured products with images
  const livingRoomProducts = products.filter(p => p.featured && p.category === "Living Room" && p.images?.length > 0);
  const kitchenProducts = products.filter(p => p.featured && p.category === "Dining Area" && p.images?.length > 0);

  // Pick the most recently added featured product (last in array)
  const featuredLivingRoom = livingRoomProducts[livingRoomProducts.length - 1];
  const featuredKitchen = kitchenProducts[kitchenProducts.length - 1];

  // Only fall back to default images if we are fully loaded and STILL have no featured product
  // While loading, use empty string to prevent flashing a different sofa
  const livingRoomImg = featuredLivingRoom ? featuredLivingRoom.images[0] : (isLoaded ? "/assets/img/living-room/living-room-1.jpg" : "");
  const kitchenImg = featuredKitchen ? featuredKitchen.images[0] : (isLoaded ? "/assets/img/dining-room/dining-room-1.jpg" : "");

  return (
    <section className="py-20 bg-surface">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Card 1: Living Room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative bg-[#F4EFEB] rounded-3xl overflow-hidden flex flex-col sm:flex-row items-center min-h-[320px] h-auto sm:h-[320px]"
          >
            <div className="relative z-10 w-full sm:w-[55%] p-8 lg:p-12 h-full flex flex-col justify-center">
              <h3 className="font-primary text-[28px] lg:text-[32px] font-semibold text-secondary leading-[1.1] mb-3">
                Living Room <br />
                <span className="text-gold">Collections</span>
              </h3>
              <p className="font-secondary text-[14px] text-secondary/70 mb-6">
                Modern looks, timeless comfort.
              </p>
              
              <Link href="/collections?category=Living Room">
                <button className="flex items-center gap-2 font-secondary text-[13px] font-semibold text-secondary group-hover:text-gold transition-colors w-fit">
                  Shop Now <PiArrowRightLight />
                </button>
              </Link>
            </div>
            
            <div className="w-full sm:w-[45%] h-[200px] sm:h-full relative overflow-hidden">
              {livingRoomImg && (
                <img 
                  src={livingRoomImg} 
                  alt="Living Room Collections"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
          </motion.div>

          {/* Card 2: Kitchen Essentials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative bg-[#F7F4EE] rounded-3xl overflow-hidden flex flex-col sm:flex-row items-center min-h-[320px] h-auto sm:h-[320px]"
          >
            <div className="relative z-10 w-full sm:w-[55%] p-8 lg:p-12 h-full flex flex-col justify-center">
              <h3 className="font-primary text-[28px] lg:text-[32px] font-semibold text-secondary leading-[1.1] mb-3">
                Kitchen <br />
                Essentials
              </h3>
              <p className="font-secondary text-[14px] text-secondary/70 mb-6">
                Smart, stylish & made for everyday.
              </p>
              
              <Link href="/collections?category=Dining Area">
                <button className="flex items-center gap-2 font-secondary text-[13px] font-semibold text-secondary group-hover:text-gold transition-colors w-fit">
                  Shop Now <PiArrowRightLight />
                </button>
              </Link>
            </div>
            
            <div className="w-full sm:w-[45%] h-[200px] sm:h-full relative overflow-hidden">
              {kitchenImg && (
                <img 
                  src={kitchenImg} 
                  alt="Kitchen Essentials"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Collections;
