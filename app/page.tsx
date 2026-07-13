import Image from "next/image";
export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#030508]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg.png"
          alt="Background"
          fill
          priority
          className="object-cover opacity-60 mix-blend-luminosity"
        />
        {/* Gradients to darken edges and center text area */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#030508]/60 to-[#030508] z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030508]/80 via-transparent to-[#030508]/90 z-10" />
      </div>
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full px-4 text-center">
        {/* Subtitle */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-px w-8 bg-[#b0a085]/50 hidden sm:block"></div>
          <p className="font-mono text-sm tracking-[0.2em] text-[#b0a085] uppercase">
            A Multiplayer AI Murder Mystery
          </p>
          <div className="h-px w-8 bg-[#b0a085]/50 hidden sm:block"></div>
        </div>
        {/* Title */}
        <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-[#f4ecd8] leading-[0.9] drop-shadow-2xl mb-8 flex flex-col items-center">
          <span>VANISHING</span>
          <span>EVIDENCE</span>
        </h1>
        {/* Tagline */}
        <div className="relative mb-16">
          <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-32 h-[1px] bg-red-600/60 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
          <p className="font-serif italic text-xl sm:text-2xl text-gray-300 drop-shadow-md">
            The paragraphs disappear. The truth remains.
          </p>
        </div>
        {/* Action Button */}
        <button className="group relative px-8 py-4 bg-red-700/80 hover:bg-red-600 border border-red-500/50 rounded transition-all duration-300 overflow-hidden shadow-[0_0_20px_rgba(185,28,28,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <span className="relative font-mono text-sm sm:text-base tracking-[0.2em] font-bold text-white uppercase drop-shadow">
            Enter The Case
          </span>
        </button>
      </div>
      {/* Footer */}
      <footer className="absolute bottom-8 z-20 w-full px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 font-mono tracking-wider">
        <span>Chapters written by AI</span>
        <span className="hidden sm:inline text-gray-600">•</span>
        <span>Interrogate</span>
        <span className="hidden sm:inline text-gray-600">•</span>
        <span>Discuss</span>
        <span className="hidden sm:inline text-gray-600">•</span>
        <span>Vote</span>
        <span className="hidden sm:inline text-gray-600">•</span>
        <span>3-8 players</span>
      </footer>
    </main>
  );
}
