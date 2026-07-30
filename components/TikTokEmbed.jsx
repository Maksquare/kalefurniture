"use client";

import { PiTiktokLogo, PiArrowUpRight } from "react-icons/pi";

const TikTokEmbed = ({ url, poster }) => {
  return (
    <div className="w-full h-full bg-black relative flex items-center justify-center group">
      {/* Background Poster Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-300 group-hover:opacity-30"
        style={{ backgroundImage: `url(${poster || 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg'})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-[400px]">
        <div className="w-16 h-16 bg-[#00f2fe]/20 text-[#00f2fe] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,242,254,0.3)]">
          <PiTiktokLogo className="w-8 h-8" />
        </div>
        
        <h3 className="text-white text-xl font-medium mb-3 font-serif">
          TikTok Restricted Video
        </h3>
        
        <p className="text-white/70 text-sm mb-8">
          TikTok has restricted this video from being embedded directly on other websites. You must open it on TikTok to view.
        </p>
        
        <a 
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:scale-105 transition-transform active:scale-95"
        >
          Watch on TikTok <PiArrowUpRight />
        </a>
      </div>
    </div>
  );
};

export default TikTokEmbed;
