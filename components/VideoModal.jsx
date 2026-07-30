"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiXLight, PiPlayCircleLight, PiPauseCircleLight, PiSpeakerHighLight, PiSpeakerSlashLight, PiPlayFill } from "react-icons/pi";
import TikTokEmbed from "./TikTokEmbed";

const PLAYLIST = [
  {
    id: "v1",
    title: "ሙሉ የቤት ፈርኒቸር ፓኬጅ - 130,000 ብር ብቻ!",
    category: "TikTok",
    src: "https://www.tiktok.com/@kale11114/video/7666550570467151121?is_from_webapp=1&sender_device=pc&web_id=7641918280929035797", 
    poster: "/images/tiktok_thumb_1.png",
    duration: "TikTok"
  },
  {
    id: "v2",
    title: "Kal Furniture Showcase 2",
    category: "TikTok",
    src: "https://www.tiktok.com/@kale11114/video/7665429885283814672?is_from_webapp=1&sender_device=pc&web_id=7641918280929035797", 
    poster: "/images/tiktok_thumb_2.png",
    duration: "TikTok"
  },
  {
    id: "v3",
    title: "Kal Furniture Showcase 3",
    category: "TikTok",
    src: "https://www.tiktok.com/@kale11114/video/7664996366501809424?is_from_webapp=1&sender_device=pc&web_id=7641918280929035797",
    poster: "/images/tiktok_thumb_3.png",
    duration: "TikTok"
  }
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.4, ease: "easeIn" } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 } 
  },
  exit: { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.4, ease: "easeInOut" } },
};

const VideoModal = ({ isOpen, onClose }) => {
  const [activeVideo, setActiveVideo] = useState(PLAYLIST[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  // Helper to extract TikTok video ID and return embed URL
  const getTikTokEmbedUrl = (url) => {
    if (!url.includes("tiktok.com")) return null;
    const match = url.match(/video\/(\d+)/);
    return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : null;
  };

  const tiktokEmbedUrl = getTikTokEmbedUrl(activeVideo.src);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setActiveVideo(PLAYLIST[0]); // Reset to first video on open
    } else {
      document.body.style.overflow = "unset";
      if (videoRef.current) videoRef.current.pause();
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const togglePlay = () => {
    if (tiktokEmbedUrl) return; // Cannot control iframe play/pause externally easily
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (tiktokEmbedUrl) return; // Cannot control iframe mute externally easily
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const selectVideo = (video) => {
    setActiveVideo(video);
    setIsPlaying(true);
    setProgress(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
          onClick={onClose}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-[210] flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:bg-gold hover:border-gold transition-all duration-300 group"
            aria-label="Close modal"
          >
            <PiXLight className="text-white/70 group-hover:text-primary text-2xl transition-colors" />
          </button>

          <motion.div
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[1400px] h-full max-h-[90vh] flex flex-col lg:flex-row bg-[#0A0A0A] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
          >
            
            {/* Left: Main Player */}
            <div className="relative flex-1 bg-black group h-[50vh] lg:h-full flex items-center justify-center">
              
              {tiktokEmbedUrl ? (
                <TikTokEmbed url={activeVideo.src} poster={activeVideo.poster} />
              ) : (
                <>
                  <video
                    key={activeVideo.id} // forces reload on change
                    ref={videoRef}
                    src={activeVideo.src}
                    poster={activeVideo.poster}
                    autoPlay
                    playsInline
                    muted={isMuted}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full h-full object-cover transition-opacity duration-700"
                  />
                  
                  {/* Video Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Center Play/Pause Overlay */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                  >
                    <div className={`w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-300 ${isPlaying ? 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100' : 'opacity-100 scale-100'}`}>
                      {isPlaying ? <PiPauseCircleLight size={48} /> : <PiPlayFill size={40} className="ml-2" />}
                    </div>
                  </div>

                  {/* Bottom Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 flex flex-col gap-6 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none">
                    <div className="pointer-events-auto flex items-end justify-between">
                      <div>
                        <span className="font-secondary text-[11px] font-semibold tracking-[0.2em] uppercase text-gold mb-2 block">
                          {activeVideo.category}
                        </span>
                        <h2 className="font-primary text-[32px] md:text-[44px] font-medium text-white leading-tight">
                          {activeVideo.title}
                        </h2>
                      </div>
                      
                      <button 
                        onClick={toggleMute}
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors"
                      >
                        {isMuted ? <PiSpeakerSlashLight size={24} /> : <PiSpeakerHighLight size={24} />}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="pointer-events-auto w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                      <div 
                        className="h-full bg-gold rounded-full transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right: Playlist */}
            <div className="w-full lg:w-[400px] xl:w-[450px] bg-[#0A0A0A] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col">
              <div className="p-8 pb-6 border-b border-white/5">
                <h3 className="font-primary text-[24px] text-white font-medium">Kal Furniture Films</h3>
                <p className="font-secondary text-[14px] text-white/50 mt-1">Immerse yourself in our world</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {PLAYLIST.map((video) => {
                  const isActive = activeVideo.id === video.id;
                  return (
                    <button
                      key={video.id}
                      onClick={() => selectVideo(video)}
                      className={`w-full flex gap-4 p-3 rounded-2xl transition-all duration-300 text-left group ${
                        isActive ? 'bg-white/10 border border-white/10' : 'bg-transparent border border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0">
                        <img 
                          src={video.poster} 
                          alt={video.title}
                          className={`w-full h-full object-cover transition-transform duration-700 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                            <motion.div 
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-primary"
                            >
                              <PiPlayFill size={14} className="ml-0.5" />
                            </motion.div>
                          </div>
                        )}
                        {!isActive && (
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 py-1">
                        <span className={`font-secondary text-[10px] font-bold tracking-widest uppercase mb-1 block ${isActive ? 'text-gold' : 'text-white/40'}`}>
                          {video.category}
                        </span>
                        <h4 className={`font-primary text-[16px] leading-tight mb-2 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                          {video.title}
                        </h4>
                        <span className="font-secondary text-[12px] text-white/30 font-medium">
                          {video.duration}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;
