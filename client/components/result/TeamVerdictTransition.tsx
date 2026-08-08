"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Paperclip, ScanBarcode, Users, FileText } from "lucide-react";
import { useRoomStore } from "@/stores/room-store";
import { useCaseStore } from "@/stores/case-store";

interface TeamVerdictTransitionProps {
  onComplete: () => void;
}

export default function TeamVerdictTransition({
  onComplete,
}: TeamVerdictTransitionProps) {
  const { resultsData, roomId, caseId, players } = useRoomStore();
  const { story } = useCaseStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 8-second progress bar fill
    const startTime = Date.now();
    const duration = 8000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(currentProgress);

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 50);

    return () => {
      clearInterval(interval);
    };
  }, [onComplete]);

  // Derived vote list: fallback to room players if resultsData votes not ready
  const votesList =
    resultsData?.votes && resultsData.votes.length > 0
      ? resultsData.votes
      : players.map((p) => ({
          playerId: p.playerId,
          playerName: p.name,
          votedSuspectId: null,
          votedSuspectName: "Accusation Logged",
        }));

  const accusedName =
    resultsData?.accusedSuspectName || "Suspect Under Accusation";
  const consensus = resultsData?.consensusPercentage ?? 0;

  return (
    <div
      className="relative flex h-dvh w-full items-start justify-center overflow-y-auto bg-[#0a0a0a] p-4 font-serif selection:bg-zinc-800 selection:text-white"
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
    >
      {/* ── ENVIRONMENTAL LIGHTING & SPOTLIGHT ──────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,65,70,0.8)_0%,rgba(5,5,5,1)_70%)]" />

      {/* Out of focus background dossier elements */}
      <div className="pointer-events-none absolute left-[10%] top-[15%] h-64 w-48 -rotate-12 bg-[#e6d8c3] opacity-[0.03] blur-xs" />
      <div className="pointer-events-none absolute bottom-[10%] right-[15%] h-40 w-64 rotate-6 bg-white opacity-[0.02] blur-[6px]" />

      {/* ── THE DOSSIER MANILA FOLDER ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 my-6 w-full max-w-2xl rounded-xs bg-[#e1d5c0] px-6 py-10 text-zinc-900 shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_0_80px_rgba(150,130,100,0.4)] sm:px-14 sm:py-14"
      >
        {/* Paper Noise Texture */}
        <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiBvcGFjaXR5PSIwLjEiLz4KPC9zdmc+')]" />

        {/* Physical Detail: Metal Paperclip */}
        <div className="absolute -top-4 left-10 rotate-12 text-zinc-400 drop-shadow-md">
          <Paperclip className="h-14 w-14 stroke-[1.5]" />
        </div>

        {/* Top Government Markings */}
        <div className="mb-8 flex items-start justify-between font-mono text-[11px] font-bold tracking-widest text-zinc-800/60 sm:text-xs">
          <div className="flex flex-col space-y-1">
            <span className="border-2 border-zinc-800/40 px-2 py-0.5 uppercase">
              Dept. of Justice
            </span>
            <span>FORM 404-SUBMITTED</span>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <ScanBarcode className="h-7 w-20 opacity-60" />
            <span>CASE: {caseId || roomId || "CLASSIFIED"}</span>
          </div>
        </div>

        {/* ── TITLE SECTION ────────────────────────────────────────────── */}
        <div className="mb-8 border-b-2 border-zinc-800/30 pb-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-red-900/80 font-bold">
            Official Case File Submission
          </p>
          <h1 className="mt-1 font-serif text-3xl font-black uppercase tracking-[0.15em] text-zinc-900 sm:text-4xl">
            Team Verdict
          </h1>
          <p className="mt-2 font-mono text-xs tracking-wider text-zinc-700">
            &quot;{story?.title || "Case Investigation Complete"}&quot;
          </p>
        </div>

        {/* ── ACCUSED MURDERER SECTION ─────────────────────────────────── */}
        <div className="relative mb-8 rounded border-2 border-zinc-800/40 bg-zinc-900/5 p-5 text-center font-mono">
          <span className="block text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
            Primary Suspect Accused By Team
          </span>
          <span className="mt-1 block font-serif text-2xl font-black uppercase tracking-wider text-zinc-900 sm:text-3xl">
            {accusedName}
          </span>

          {/* Animated Rubber Stamp: VERDICT FILED */}
          <motion.div
            initial={{ scale: 3, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 0.9, rotate: -8 }}
            transition={{
              delay: 0.3,
              duration: 0.35,
              type: "spring",
              stiffness: 200,
            }}
            className="pointer-events-none absolute right-4 top-2 rounded border-4 border-red-800 px-3 py-1 font-serif text-xl font-black uppercase tracking-widest text-red-800 opacity-90 mix-blend-multiply sm:right-6 sm:text-2xl"
          >
            VERDICT FILED
          </motion.div>
        </div>

        {/* ── VOTE BREAKDOWN GRID ──────────────────────────────────────── */}
        <div className="mb-8 font-mono">
          <div className="mb-3 flex items-center justify-between border-b border-zinc-800/20 pb-2">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-700">
              <Users className="h-3.5 w-3.5" /> Detective Accusations
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">
              Consensus: {consensus}%
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {votesList.map((v, idx) => (
              <div
                key={v.playerId || idx}
                className="flex items-center justify-between rounded bg-zinc-900/5 px-3 py-2 text-xs border border-zinc-800/20"
              >
                <span className="font-semibold text-zinc-800 truncate max-w-[120px]">
                  {v.playerName}
                </span>
                <span className="text-zinc-500 mx-1">→</span>
                <span className="font-bold text-zinc-900 truncate max-w-[130px]">
                  {v.votedSuspectName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8-SECOND COUNTDOWN PROGRESS BAR ──────────────────────────── */}
        <div className="mt-8 pt-4 border-t-2 border-zinc-800/20 font-mono">
          <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3 w-3 animate-pulse text-red-900" />
              Unsealing Case File & Final Evidence...
            </span>
            <span>{Math.max(0, Math.ceil((8000 - progress * 80) / 1000))}s</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/20">
            <div
              className="h-full bg-zinc-900 transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
