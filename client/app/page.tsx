import Image from "next/image";
import { Cinzel, Special_Elite } from "next/font/google";
import BloodDrop from "@/components/hero/BloodDrop";
import Button from "@/components/hero/Button";
import Knife from "@/components/hero/Knife";

// Initialize thematic cinematic fonts
const cinematicSerif = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel",
});

const typewriter = Special_Elite({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-typewriter",
});

export default function Home() {
  return (
    <main
      className={`${cinematicSerif.variable} ${typewriter.variable} relative h-screen w-full bg-black text-gray-200 overflow-hidden flex flex-col justify-between`}
    >
      {/* ================= BACKGROUND & CINEMATIC OVERLAYS ================= */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {/* Ambient Dark Vignette Filter */}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-black z-10" />
        <div className="absolute inset-0 bg-radial-vignette z-10 pointer-events-none" />

        {/* Base Atmospheric Background Image */}
        <Image
          src="/Gemini_Generated_Image_ombri0ombri0ombr-Photoroom.png"
          alt="Atmospheric Background"
          fill
          priority
          className="object-cover mix-blend-luminosity opacity-50 mid:opacity-60 transition-opacity duration-700"
        />

        {/* KNIFE Graphic */}
        <Knife />
      </div>

      {/* ================= BLOOD DROP OVERLAY (above all layers) ================= */}
      {/* Mirrors knife container centering so drop sits at the blade tip */}
      <div className="absolute inset-0 z-40 pointer-events-none select-none overflow-hidden">
        <div className="absolute left-1/2 top-1/2 w-[90vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 md:w-[65vw]">
          <BloodDrop />
        </div>
      </div>

      {/* ================= RESPONSIVE CONTENT LAYER ================= */}
      <div className="relative z-20 flex-1 flex flex-col justify-between items-center w-full max-w-7xl mx-auto px-6 py-12 md:py-16 text-center lg:text-left">
        {/* Top Header Section */}
        <header className="w-full flex flex-col items-center lg:items-start gap-6">
          {/* AI Feature Tag */}
          <button
            disabled
            className="font-sans text-xs md:text-sm tracking-[0.25em] uppercase border border-amber-50/20 bg-black/60 backdrop-blur-md px-5 py-2 rounded-full text-amber-200/90 font-bold shadow-lg shadow-black/50 cursor-not-allowed"
          >
            AI-Powered Multiplayer Detective Experience
          </button>

          {/* Main Title Group */}
          <div className="space-y-4 mt-4">
            <h1 className="font-cinzel font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider text-transparent bg-clip-text bg-linear-to-b from-gray-50 via-gray-200 to-gray-500 drop-shadow-[0_10px_15px_rgba(0,0,0,0.9)]">
              INQUEST
            </h1>

            <p className="font-cinzel font-medium text-sm sm:text-base md:text-xl tracking-[0.3em] text-gray-300 uppercase max-w-xl mx-auto lg:mx-0 balance">
              Every case has a different truth.
            </p>
          </div>
        </header>

        {/* Middle/Lower Core Controls Section */}
        <div className="w-full flex flex-col items-center justify-center gap-10 mt-auto pt-16">
          {/* Game Information Subtitle */}
          <p className="font-typewriter text-xs sm:text-sm md:text-base tracking-widest text-red-500/90 max-w-lg bg-black/40 backdrop-blur-sm p-3 border border-red-950/40 rounded-sm">
            INTERROGATE • DISCUSS • VOTE • 2-4 PLAYERS
          </p>

          {/* Primary Action Button */}
          <Button />
        </div>
      </div>
    </main>
  );
}
