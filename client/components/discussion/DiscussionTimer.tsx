"use client";

import { useRoomStore } from "@/stores/room-store";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { toast } from "sonner";

export default function DiscussionTimer() {
  const { phaseStartedAt, phaseDuration } = useRoomStore();
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const hasShownWarning = useRef(false);

  useEffect(() => {
    if (!phaseStartedAt || !phaseDuration) {
      setRemainingSeconds(null);
      return;
    }

    // Calculate initial remaining time
    const calculateRemaining = () => {
      const elapsed = (Date.now() - phaseStartedAt) / 1000;
      const remaining = Math.max(0, phaseDuration - elapsed);
      return Math.floor(remaining);
    };

    // Set initial value
    setRemainingSeconds(calculateRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);

      // Show warning toast at 30 seconds
      if (remaining === 30 && !hasShownWarning.current) {
        toast.warning("30 seconds remaining", {
          description: "Submit your vote before time runs out!",
        });
        hasShownWarning.current = true;
      }

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      hasShownWarning.current = false;
    };
  }, [phaseStartedAt, phaseDuration]);

  if (remainingSeconds === null) {
    return null;
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Determine state based on time remaining
  const isCritical = remainingSeconds <= 10;
  const isWarning = remainingSeconds <= 30 && !isCritical;
  const isExpired = remainingSeconds === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center justify-center gap-2 rounded-xl border px-5 shadow-lg transition-all ${
        isCritical
          ? "animate-pulse border-red-600/60 bg-red-950/40 shadow-[0_0_25px_rgba(220,38,38,0.3)]"
          : isWarning
            ? "border-yellow-600/60 bg-yellow-950/30 shadow-[0_0_20px_rgba(202,138,4,0.2)]"
            : isExpired
              ? "border-zinc-700/60 bg-zinc-900/60"
              : "border-zinc-700/60 bg-zinc-900/60"
      }`}
    >
      <Clock
        className={`h-4 w-4 ${
          isCritical
            ? "text-red-400"
            : isWarning
              ? "text-yellow-400"
              : "text-zinc-400"
        }`}
      />
      <div className="flex gap-2 items-center">
        <span
          className={`font-mono text-xl font-bold tracking-wider ${
            isCritical
              ? "text-red-400"
              : isWarning
                ? "text-yellow-400"
                : "text-zinc-300"
          }`}
        >
          {formattedTime}
        </span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
          {isExpired ? "Time's Up" : "Remaining"}
        </span>
      </div>
    </motion.div>
  );
}
