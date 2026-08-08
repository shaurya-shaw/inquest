"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRoomStore } from "@/stores/room-store";
import { useInterrogationStore } from "@/stores/interrogation-store";

const INTERROGATION_DURATION = 5 * 60; // 5 minutes in seconds

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

export default function InterrogationTimer() {
  const { phaseStartedAt, phaseDuration } = useRoomStore();
  const interrogationStartedAt = useInterrogationStore((s) => s.interrogationStartedAt);
  const ended = useInterrogationStore((s) => s.interrogationEnded);
  const [remaining, setRemaining] = useState(INTERROGATION_DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const startTime = phaseStartedAt || interrogationStartedAt;
    const duration = phaseDuration || INTERROGATION_DURATION;

    if (!startTime || ended) return;

    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setRemaining(Math.max(0, duration - elapsed));
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phaseStartedAt, interrogationStartedAt, phaseDuration, ended]);

  const isUrgent = remaining <= 30;
  const isLow = remaining <= 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/40 px-3 py-2"
    >
      <span
        className={`text-[10px] uppercase tracking-[0.15em] ${
          isUrgent ? "text-red-500" : "text-zinc-500"
        }`}
      >
        ⏱
      </span>
      <span
        className={`font-mono text-sm font-semibold tabular-nums ${
          isUrgent
            ? "text-red-300 animate-pulse"
            : isLow
              ? "text-amber-300"
              : "text-zinc-200"
        }`}
      >
        {ended ? "0:00" : formatTime(remaining)}
      </span>
      {ended && (
        <span className="text-[9px] uppercase tracking-[0.1em] text-zinc-600">
          Time&apos;s up
        </span>
      )}
    </motion.div>
  );
}
