"use client";

import { motion } from "framer-motion";

export default function BloodDrop() {
  return (
    <motion.img
      src="/BloodDrop.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      className="pointer-events-none select-none origin-top will-change-transform"
      style={{
        position: "absolute",
        left: "94%",
        top: "44%",
        width: "clamp(40px, 6vw, 120px)",
        zIndex: 50,
      }}
      animate={{
        // ── Segment map (all linear = constant velocity during fall) ──────────
        //   t=0.00  hold invisible at knife tip
        //   t=0.18  appear (quick opacity pop)
        //   t=0.20  fall begins  ← single linear segment keeps speed constant
        //   t=0.80  fall ends at blood pool
        //   t=0.88  vanish at pool
        //   t=0.89  reset to top (invisible) ← matches t=0 so loop is seamless
        //   t=1.00  seamless loop back to t=0
        opacity: [0, 0, 1, 1, 1, 0, 0, 0],
        y: ["0px", "0px", "0px", "50vh", "50vh", "50vh", "0px", "0px"],
        scaleY: [1.0, 1.0, 0.85, 1.15, 0.3, 0.3, 1.0, 1.0],
        scaleX: [1.0, 1.0, 1.0, 0.9, 1.5, 1.5, 1.0, 1.0],
      }}
      transition={{
        duration: 3.2,
        repeat: Infinity,
        ease: "linear", // single linear ease = no speed changes at all
        times: [0, 0.18, 0.2, 0.8, 0.84, 0.88, 0.89, 1.0],
      }}
    />
  );
}
