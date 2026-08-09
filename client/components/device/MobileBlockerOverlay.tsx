"use client";

import { Paperclip, ScanBarcode, ShieldAlert } from "lucide-react";

export default function MobileBlockerOverlay() {
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#070709] p-4 text-center select-none md:hidden font-serif">
      {/* Ambient Noir Spotlight & CRT Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(80,20,20,0.4)_0%,rgba(5,5,5,0.95)_75%)]" />

      {/* CRT Scanline & Grain Texture */}
      <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiBvcGFjaXR5PSIwLjEiLz4KPC9zdmc+')]"></div>

      {/* Manila Folder Dossier Container */}
      <div className="relative z-10 w-full max-w-sm rounded-xs bg-[#d8cbba] px-6 py-10 text-zinc-900 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_0_80px_rgba(120,100,70,0.4)] border border-red-950/40">
        {/* Metal Paperclip Top Left */}
        <div className="absolute -top-4 left-6 rotate-12 text-zinc-500 drop-shadow-md">
          <Paperclip className="h-12 w-12 stroke-[1.5]" />
        </div>

        {/* Top Header Barcode */}
        <div className="mb-6 flex items-center justify-between font-mono text-[10px] font-bold tracking-widest text-zinc-700">
          <span className="border border-red-900/40 px-2 py-0.5 text-red-900 uppercase">
            FORM 403-MOBILE
          </span>
          <ScanBarcode className="h-6 w-16 opacity-60" />
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl font-black uppercase tracking-[0.2em] text-zinc-900 drop-shadow-xs">
          INQUEST
        </h1>

        {/* Distressed Divider Line */}
        <div className="my-4 flex items-center justify-center gap-1 text-zinc-500">
          <div className="h-px w-full bg-zinc-800/40" />
          <span className="font-mono text-xs tracking-widest px-2">
            ─────────────────
          </span>
          <div className="h-px w-full bg-zinc-800/40" />
        </div>

        {/* ACCESS DENIED Rubber Stamp */}
        <div className="my-5 inline-block transform -rotate-2 rounded border-4 border-red-900/80 bg-red-950/10 px-5 py-2 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 font-mono text-xl font-black uppercase tracking-widest text-red-950">
            <ShieldAlert className="h-6 w-6 text-red-900" />
            <span>ACCESS DENIED</span>
          </div>
        </div>

        {/* Notice Body */}
        <div className="my-5 space-y-2 font-serif text-sm leading-relaxed text-zinc-800 font-medium">
          <p className="font-bold text-zinc-900">
            This investigation requires a larger display.
          </p>
          <p className="text-xs text-zinc-700">
            Please switch to a laptop or desktop computer.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <span className="w-full rounded bg-gradient-to-b from-[#6d1010] via-[#4d0808] to-[#220202] border border-red-800/80 py-3 px-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg transition-all hover:border-red-600 active:scale-95 cursor-pointer">
            [ RETURN LATER ]
          </span>
        </div>

        {/* Monospaced Footer Watermark */}
        <div className="mt-6 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600">
          CASE INTERFACE // DESKTOP
        </div>
      </div>
    </div>
  );
}
