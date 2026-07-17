"use client";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";

type InvestigationCardProps = {
  head1?: string;
  head2?: string;
  description?: string;
  path: string;
};

export default function InvestigationCard({
  head1,
  head2,
  description,
  path,
}: InvestigationCardProps) {
  const router = useRouter();
  return (
    <CardSpotlight className="group relative h-[420px] w-full max-w-[420px] overflow-hidden rounded-2xl border border-red-950/60 bg-black p-8 transition-all duration-500 hover:border-red-800/80 hover:shadow-[0_0_30px_rgba(220,38,38,0.1)]">
      {/* Optional faint background texture for a "screen" effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.03)_0,transparent_100%)] mix-blend-screen" />

      {/* Header: Icon & System Status */}
      <div className="relative z-20 flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-md border border-red-900/50 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.1)] transition-all duration-500 group-hover:bg-red-900/40">
          <Fingerprint className="h-7 w-7 text-red-600 transition-all duration-500 group-hover:scale-110 group-hover:text-red-400" />
        </div>

        {/* Blinking Status Indicator */}
        <div className="flex items-center gap-2 rounded-full border border-red-900/30 bg-red-950/20 px-3 py-1.5">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,1)]"></div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-red-500/80">
            System Idle
          </span>
        </div>
      </div>

      {/* Title Area */}
      <div className="relative z-20 mt-10">
        <p className="mb-2 font-mono text-[10px] font-semibold tracking-[0.2em] text-red-700">
          &gt; _ NEW_DOSSIER.EXE
        </p>
        <h2 className="text-3xl font-black uppercase tracking-[0.1em] text-zinc-100 transition-colors group-hover:text-white">
          {head1} <br />
          <span className="bg-gradient-to-r from-red-500 to-red-800 bg-clip-text text-transparent">
            {head2}
          </span>
        </h2>
      </div>

      {/* Description */}
      <p className="relative z-20 mt-4 font-mono text-xs leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400">
        {description}
      </p>

      {/* Tech/Cyber Divider */}
      <div className="relative z-20 mt-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-red-800/80 via-red-900/20 to-transparent" />
        <span className="font-mono text-[10px] tracking-[0.3em] text-red-800">
          RESTRICTED
        </span>
      </div>

      {/* Footer Area */}
      <div className="relative z-20 mt-6 flex items-end justify-between">
        <div className="space-y-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600">
            Auth Level
          </p>
          <p className="font-mono text-xs font-semibold text-red-500/70">
            DETECTIVE
          </p>
        </div>

        {/* Action Button */}
        <button
          className="relative overflow-hidden rounded-sm border border-red-900 bg-red-950/40 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-red-500 transition-all duration-300 hover:border-red-500 hover:bg-red-900/60 hover:text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] active:scale-95"
          onClick={() => {
            // Navigate to the investigation creation page
            router.push(path);
          }}
        >
          <span className="flex items-center gap-2">
            Execute
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500"></span>
            </span>
          </span>
        </button>
      </div>
    </CardSpotlight>
  );
}
