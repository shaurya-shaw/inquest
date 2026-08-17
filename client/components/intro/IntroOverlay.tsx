"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntroOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setHasMounted(true);
    try {
      const seen = sessionStorage.getItem("inquest_intro_seen");
      if (!seen) {
        setIsVisible(true);
      }
    } catch {
      // Storage access blocked or restricted — skip intro
      setIsVisible(false);
    }
  }, []);

  const handleFinish = () => {
    try {
      sessionStorage.setItem("inquest_intro_seen", "true");
    } catch {
      // Ignore storage error
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (!isVisible || !videoRef.current) return;

    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Intro video autoplay failed or was prevented:", err);
        handleFinish();
      });
    }
  }, [isVisible]);

  if (!hasMounted || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden select-none pointer-events-auto"
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            controls={false}
            onEnded={handleFinish}
            onError={handleFinish}
            className="h-full w-full object-cover"
          >
            <source src="/intro-v3.webm" type="video/webm" />
            <source src="/intro-v3.mp4" type="video/mp4" />
          </video>

          {/* Skip Intro Button */}
          <button
            onClick={handleFinish}
            type="button"
            className="absolute bottom-8 right-8 z-10 flex items-center gap-2 rounded border border-neutral-700/80 bg-black/60 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 backdrop-blur-md transition-all hover:border-red-800 hover:bg-black/90 hover:text-white cursor-pointer shadow-lg active:scale-95"
          >
            <span>[ SKIP_INTRO ]</span>
            <span className="text-red-500 font-bold">➔</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
