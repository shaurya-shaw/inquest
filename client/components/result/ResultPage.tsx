"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Paperclip, ScanBarcode, Check, RotateCcw } from "lucide-react";
import { useRoomStore } from "@/stores/room-store";
import { useCaseStore } from "@/stores/case-store";
import { useRouter } from "next/navigation";
import TeamVerdictTransition from "./TeamVerdictTransition";
import { clearGameSessionData } from "@/lib/session-cleanup";

export default function ResultPage() {
  const [showTransition, setShowTransition] = useState(true);
  const { resultsData, roomId, caseId } = useRoomStore();
  const { story, caseBrief, evidence, suspects } = useCaseStore();
  const router = useRouter();

  const handleReturnHome = () => {
    clearGameSessionData();
    router.push("/");
  };

  if (showTransition) {
    return (
      <TeamVerdictTransition onComplete={() => setShowTransition(false)} />
    );
  }

  const isCorrect = resultsData?.isCorrect ?? false;
  const murdererName = resultsData?.murdererName || "Unknown Suspect";
  const accusedName = resultsData?.accusedSuspectName || "No Consensus Reached";
  const consensus = resultsData?.consensusPercentage ?? 0;
  const murdererSuspect = suspects.find(
    (s) => s.id === resultsData?.murdererId,
  );
  const motiveText =
    resultsData?.murdererMotive ||
    murdererSuspect?.possibleMotive ||
    "Motivated by conflict & opportunity";

  return (
    <div
      className="relative flex h-dvh w-full items-start justify-center overflow-y-auto bg-[#0a0a0a] p-4 font-serif text-zinc-900 selection:bg-zinc-800 selection:text-white"
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
    >
      {/* Environmental Lighting */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(60,65,70,0.8)_0%,rgba(5,5,5,1)_70%)]" />

      {/* Out of focus background elements */}
      <div className="pointer-events-none fixed left-[10%] top-[15%] h-64 w-48 -rotate-12 bg-[#e6d8c3] opacity-[0.03] blur-xs" />
      <div className="pointer-events-none fixed bottom-[10%] right-[15%] h-40 w-64 rotate-6 bg-white opacity-[0.02] blur-[6px]" />

      {/* ── THE DOSSIER MANILA FOLDER ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 my-8 w-full max-w-3xl rounded-xs bg-[#e1d5c0] px-6 py-10 text-zinc-900 shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_0_80px_rgba(150,130,100,0.4)] sm:px-16 sm:py-16"
      >
        {/* Paper Texture Overlay */}
        <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiBvcGFjaXR5PSIwLjEiLz4KPC9zdmc+')]" />

        {/* Physical Detail: Metal Paperclip */}
        <div className="absolute -top-4 left-10 rotate-12 text-zinc-400 drop-shadow-md">
          <Paperclip className="h-16 w-16 stroke-[1.5]" />
        </div>

        {/* Top Government Markings */}
        <div className="mb-8 flex items-start justify-between font-mono text-xs font-bold tracking-widest text-zinc-800/60">
          <div className="flex flex-col space-y-1">
            <span className="border-2 border-zinc-800/40 px-2 py-0.5 uppercase">
              Dept. of Justice
            </span>
            <span>FORM 404-CLOSED</span>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <ScanBarcode className="h-8 w-24 opacity-60" />
            <span>
              ID: {story?.caseId || caseId || roomId || "CASE-0042"} — CLOSED
            </span>
          </div>
        </div>

        {/* ── CASE FILE TITLE SECTION ───────────────────────────────────── */}
        <div className="relative mb-10 border-b-2 border-zinc-800/30 pb-8 text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.35em] text-zinc-600">
            Official Investigation Record
          </p>
          <h1 className="mt-1 font-serif text-3xl font-black uppercase tracking-[0.15em] text-zinc-900 sm:text-5xl">
            {story?.title || "Case Resolution File"}
          </h1>
          <p className="mt-2 font-mono text-xs tracking-wider text-zinc-700">
            CASE FILE — {story?.caseId || caseId || "CASE-0042"} — CLOSED
          </p>
        </div>

        {/* ── SLAPPED RUBBER STAMP: CASE SOLVED vs CASE FAILED ──────────── */}
        <div className="relative mb-10 flex flex-col items-center justify-center rounded border-2 border-dashed border-zinc-800/30 p-8 bg-zinc-900/5">
          {/* Animated Stamp Slapped onto Dossier */}
          <motion.div
            initial={{ scale: 3.5, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 0.95, rotate: -12 }}
            transition={{
              duration: 0.4,
              type: "spring",
              stiffness: 220,
              damping: 15,
            }}
            className={[
              "pointer-events-none absolute z-20 rounded border-4 px-6 py-2 font-serif text-3xl font-black uppercase tracking-widest mix-blend-multiply sm:text-5xl shadow-lg",
              isCorrect
                ? "border-emerald-700/70 text-emerald-800/60 bg-emerald-950/10"
                : "border-red-800/70 text-red-900/60 bg-red-950/10",
            ].join(" ")}
          >
            {isCorrect ? "STATUS: CASE SOLVED" : "STATUS: CASE FAILED"}
          </motion.div>

          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-1">
            Target Identified By Medical Examiner & Forensics
          </span>
          <h2 className="font-serif text-2xl font-black uppercase tracking-wider text-zinc-900 sm:text-3xl">
            Murderer: {murdererName}
          </h2>
        </div>

        {/* ── FINAL RECONSTRUCTION ──────────────────────────────────────── */}
        <div className="mb-10 font-serif">
          <div className="mb-3 flex items-center gap-2 border-b border-zinc-800/30 pb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-800">
              Final Reconstruction
            </span>
          </div>
          <div className="rounded border border-zinc-800/20 bg-zinc-900/5 p-5">
            <p className="text-sm sm:text-base leading-relaxed italic text-zinc-800">
              &quot;
              {caseBrief ||
                story?.paragraphs?.[0] ||
                "Investigation completed."}
              &quot;
            </p>
          </div>
        </div>

        {/* ── EVIDENCE CHECKLIST ────────────────────────────────────────── */}
        <div className="mb-10 font-mono">
          <div className="mb-3 border-b border-zinc-800/30 pb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-800">
              Recovered Evidence Catalog
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {evidence && evidence.length > 0 ? (
              evidence.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 rounded bg-zinc-900/5 px-3.5 py-2 text-xs border border-zinc-800/20"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-emerald-800 bg-emerald-800/20 text-emerald-900 font-bold">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span className="font-bold text-zinc-900">{item.name}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-2.5 rounded bg-zinc-900/5 px-3.5 py-2 text-xs border border-zinc-800/20">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-emerald-800 bg-emerald-800/20 text-emerald-900 font-bold">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span className="font-bold text-zinc-900">
                    Forensic Physical Evidence
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded bg-zinc-900/5 px-3.5 py-2 text-xs border border-zinc-800/20">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-emerald-800 bg-emerald-800/20 text-emerald-900 font-bold">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span className="font-bold text-zinc-900">
                    Security Access Logs
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── INVESTIGATORS' VERDICT (Dot-Leader Monospace Table) ───────── */}
        <div className="mb-10 font-mono">
          <div className="mb-3 border-b border-zinc-800/30 pb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-800">
              Investigators&apos; Verdict Summary
            </span>
          </div>

          <div className="space-y-2 rounded border border-zinc-800/30 bg-zinc-900/5 p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 font-bold">
                Murderer ....................
              </span>
              <span className="font-bold text-zinc-900">{murdererName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 font-bold">
                Accused ....................
              </span>
              <span className="font-bold text-zinc-900">{accusedName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 font-bold">
                Motive ....................
              </span>
              <span className="font-bold text-zinc-900 truncate max-w-[280px]">
                {motiveText}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 font-bold">
                Team Consensus ..............
              </span>
              <span className="font-bold text-zinc-900">{consensus}%</span>
            </div>
          </div>
        </div>

        <div className="my-8 h-px w-full bg-zinc-800/30" />

        {/* ── FOOTER STAMP & RETURN ACTION ─────────────────────────────── */}
        <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Stamped Case Closed Mark */}
          <div className="relative flex items-center justify-center border-2 border-dashed border-zinc-800/40 px-6 py-3 rounded">
            <span className="font-serif text-lg font-black uppercase tracking-[0.25em] text-zinc-800/70">
              CASE CLOSED
            </span>
          </div>

          {/* Brushed Metal Button */}
          <button
            onClick={handleReturnHome}
            className="group relative overflow-hidden rounded bg-zinc-900 px-8 py-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-all hover:text-white active:scale-95 active:shadow-none"
          >
            <div className="absolute inset-0 border border-red-900/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[inset_0_0_15px_rgba(220,38,38,0.2)]" />
            <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiBvcGFjaXR5PSIwLjEiLz4KPC9zdmc+')]" />
            <span className="relative z-10 flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> Return To Headquarters
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
