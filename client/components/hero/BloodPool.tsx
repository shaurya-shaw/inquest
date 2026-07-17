
"use client";

import { motion } from "framer-motion";

const PATH =
  "M0 70 C120 25 260 95 420 55 C640 5 840 90 1060 45 C1320 0 1540 80 1740 40 C1840 20 1880 35 1920 28 L1920 220 L0 220 Z";

export default function BloodPool() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-14 sm:h-22 md:h-20 overflow-hidden pointer-events-none z-10 forward-layer">
      {/* Ambient Crimson Mist Overlay */}
      <motion.div
        className="absolute inset-x-0 top-0 h-12 md:h-20 will-change-transform"
        style={{
          background:
            "linear-gradient(to bottom, rgba(140, 0, 0, 0.4), transparent)",
        }}
        animate={{
          x: [0, -30, 20, 0],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Interactive Fluid Blood Wave */}
      <motion.svg
        viewBox="0 0 1920 220"
        preserveAspectRatio="none"
        className="absolute bottom-0 w-full h-full drop-shadow-[0_-5px_10px_rgba(0,0,0,0.5)] will-change-opacity"
        animate={{
          opacity: [0.95, 1, 0.95],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <defs>
          {/* Deep Cinematic Blood Gradient */}
          <linearGradient id="blood-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9a0000" />
            <stop offset="25%" stopColor="#630000" />
            <stop offset="100%" stopColor="#1a0000" />
          </linearGradient>

          {/* Wet Coagulated Highlight */}
          <linearGradient id="blood-highlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.25)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </linearGradient>

          {/* Micro-Turbulence Displacement Map */}
          <filter id="liquid-displacement">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves="2"
              seed="4"
            >
              <animate
                attributeName="baseFrequency"
                values="0.012;0.015;0.012"
                dur="16s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="8" />
          </filter>
        </defs>

        {/* Liquid Body Base */}
        <path
          d={PATH}
          fill="url(#blood-gradient)"
          filter="url(#liquid-displacement)"
        />

        {/* Dynamic Surface Light Reflection */}
        <motion.path
          d={PATH}
          fill="none"
          stroke="url(#blood-highlight)"
          strokeWidth="4"
          className="will-change-opacity"
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.svg>
    </div>
  );
}
