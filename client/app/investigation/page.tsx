import { AnimatedHeading } from "@/components/encrypted-text-demo-2";
import CreateInvestigationCard from "@/components/card-spotlight-demo";
import JoinInvestigationCard from "@/components/card-spotlight-demo";

export default function InvestigationPage() {
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat selection:bg-red-900/50 selection:text-white"
      style={{ backgroundImage: "url('/InvestigationBg.png')" }}
    >
      {/* 
        MAIN CONTENT WRAPPER 
        Changed to standard flex-col with py-12 to guarantee minimum top/bottom padding 
      */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        {/* 
          INNER FLEX CONTAINER 
          flex-1 lets this take up available space and justify-center keeps it vertically centered.
          If the screen is too small, it will naturally expand without cutting off the bottom padding.
        */}
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          {/* HEADER SECTION */}
          <div className="mb-8 flex flex-col items-center justify-center space-y-4 text-center md:mb-12">
            <div className="flex items-center gap-2 rounded-full border border-red-900/30 bg-black/40 px-3 py-1.5 backdrop-blur-md sm:px-4">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)] sm:h-2 sm:w-2"></span>
              <span className="font-mono text-[9px] tracking-[0.2em] text-red-500/90 sm:text-[10px]">
                SECURE CONNECTION ESTABLISHED
              </span>
            </div>

            <AnimatedHeading
              className="text-center text-2xl font-bold tracking-[0.18em] text-white sm:text-3xl md:text-4xl lg:text-5xl"
              text="INVESTIGATION ROOM"
            />

            <p className="max-w-2xl font-mono text-[10px] leading-relaxed tracking-[0.14em] text-zinc-400 sm:text-xs sm:tracking-[0.2em] md:text-sm">
              [ <span className="text-red-700">SYS.MSG</span> ] EVERY CASE
              BEGINS WITH A CLUE.
            </p>
          </div>

          {/* CARDS LAYOUT */}
          <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-8 md:flex-row md:gap-8 lg:gap-16">
            <div className="w-full max-w-105">
              <CreateInvestigationCard
                head1="CREATE"
                head2="INVESTIGATION"
                description="Initialize a multiplayer detective matrix. Compile evidence and collaborate to solve complex case files."
                path="/investigation/create"
              />
            </div>
            <div className="w-full max-w-105">
              <JoinInvestigationCard
                head1="JOIN"
                head2="INVESTIGATION"
                description="Access an active crime scene. Sync with other detectives and uncover the truth before the trail goes cold."
                path="/investigation/join"
              />
            </div>
          </div>
        </div>

        {/* Ambient Footer Watermark */}
        <div className="mt-16 whitespace-nowrap font-mono text-[8px] tracking-[0.4em] text-zinc-500 sm:text-[10px]">
          AI_DETECTIVE_OS // V.1.0.4
        </div>
      </div>
    </div>
  );
}
