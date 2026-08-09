"use client";

import { useState } from "react";
import HowToInvestigateModal from "./HowToInvestigateModal";

export default function Button() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="group relative overflow-hidden font-cinzel text-lg md:text-xl font-bold tracking-[0.2em] uppercase py-4 px-12 text-white rounded-none cursor-pointer bg-linear-to-b from-[#6d1010] via-[#4d0808] to-[#220202] border border-red-900/70 shadow-[0_12px_35px_rgba(0,0,0,.65),0_0_20px_rgba(120,0,0,.18)] transition-all duration-300 hover:border-red-700 hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(0,0,0,.8),0_0_28px_rgba(160,0,0,.35)] active:translate-y-0.5"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Moving metallic shine */}
        <span
          className="
        absolute inset-0
        -translate-x-full
        group-hover:translate-x-full
        transition-transform
        duration-1000
        ease-out
        bg-linear-to-r
        from-transparent
        via-white/15
        to-transparent
        skew-x-[-25deg]
      "
        />

        {/* Inner bevel */}
        <span
          className="
        absolute inset-px
        border
        border-white/5
        pointer-events-none
      "
        />

        {/* Bottom shadow for depth */}
        <span
          className="
        absolute
        left-0
        right-0
        bottom-0
        h-[2px]
        bg-black/40
        pointer-events-none
      "
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <span className="relative z-10">Start Case</span>
      </button>

      <HowToInvestigateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
