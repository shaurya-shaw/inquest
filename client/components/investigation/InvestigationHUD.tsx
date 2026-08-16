"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "@/lib/socket";
import { useRoomStore } from "@/stores/room-store";
import { usePlayerStore } from "@/stores/player-store";
import { MIN_INVESTIGATION_TIME } from "@/lib/investigation-config";

/** Format seconds into M:SS display */
function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

/**
 * Floating Investigation & Interrogation HUD.
 *
 * Anchored at the top-center of the viewport. Shows:
 * - Max-timer countdown
 * - Live ready count
 * - Ready button (visible after 2 minutes elapse)
 *
 * Renders when phase === "INVESTIGATION" || phase === "INTERROGATION".
 */
export default function InvestigationHUD() {
  const { phase, phaseStartedAt, phaseDuration, readyPlayers, players, roomId, maxInvestigators } =
    useRoomStore();
  const { playerId } = usePlayerStore();

  // Seconds remaining on the max timer
  const [timeRemaining, setTimeRemaining] = useState<number>(
    phaseDuration ?? 0
  );
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Optimistic local ready state
  const isReady = playerId ? readyPlayers.includes(playerId) : false;

  useEffect(() => {
    if (
      (phase !== "INVESTIGATION" && phase !== "INTERROGATION") ||
      !phaseStartedAt ||
      !phaseDuration
    )
      return;

    const isDemo = maxInvestigators === 1;
    const minTimeThreshold = isDemo
      ? 10
      : phase === "INVESTIGATION"
        ? MIN_INVESTIGATION_TIME
        : 120;

    const tick = () => {
      const elapsedSeconds = (Date.now() - phaseStartedAt) / 1000;
      const remaining = phaseDuration - elapsedSeconds;
      setTimeRemaining(remaining);
      setMinTimeElapsed(elapsedSeconds >= minTimeThreshold);
    };

    tick(); // run immediately
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, phaseStartedAt, phaseDuration]);

  const handleReady = () => {
    if (!roomId || isReady || !minTimeElapsed) return;
    socket.emit("detective-ready");
  };

  if (phase !== "INVESTIGATION") return null;

  const connectedCount = players.filter((p) => p.connected).length;
  const readyCount = readyPlayers.length;
  const readyButtonLabel =
    phase === "INVESTIGATION"
      ? "✓ Ready for Interrogation"
      : "✓ Ready for Discussion";

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed left-1/2 top-4 z-50 -translate-x-1/2"
      role="status"
      aria-label="Phase status"
    >
      <div
        className="
          flex flex-col items-center gap-2 rounded-2xl border border-white/10
          bg-black/60 px-5 py-3 shadow-2xl shadow-black/50
          backdrop-blur-md
        "
      >
        {/* Top row: timer + ready count */}
        <div className="flex items-center gap-4">
          {/* Countdown */}
          <div className="flex items-center gap-1.5">
            <span
              className={`
                font-mono text-xs tracking-[0.15em]
                ${timeRemaining <= 30 ? "text-red-400" : "text-zinc-400"}
              `}
              aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
            >
              ⏱
            </span>
            <span
              className={`
                font-mono text-sm font-semibold tabular-nums
                ${timeRemaining <= 30 ? "text-red-300" : "text-zinc-200"}
              `}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Divider */}
          <span className="h-3.5 w-px bg-white/15" aria-hidden="true" />

          {/* Ready count */}
          <span className="font-mono text-[10px] tracking-[0.15em] text-zinc-500 uppercase">
            <span className="text-zinc-300">{readyCount}</span>
            {" / "}
            <span className="text-zinc-300">{connectedCount}</span>
            {" Ready"}
          </span>
        </div>

        {/* Ready button — only shown after 2 minutes elapse */}
        <AnimatePresence>
          {minTimeElapsed && (
            <motion.div
              key="ready-btn"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {isReady ? (
                /* Waiting state */
                <div
                  className="
                    flex items-center gap-1.5 rounded-full border border-zinc-700/50
                    bg-zinc-800/60 px-4 py-1.5
                    font-mono text-[10px] tracking-[0.15em] text-zinc-500 uppercase
                  "
                  aria-live="polite"
                >
                  <span className="text-green-500">✓</span>
                  Waiting for other detectives...
                </div>
              ) : (
                /* Ready button */
                <motion.button
                  id="phase-ready-btn"
                  onClick={handleReady}
                  whileTap={{ scale: 0.96 }}
                  className="
                    rounded-full border border-zinc-600/60 bg-zinc-800/70 px-4 py-1.5
                    font-mono text-[10px] tracking-[0.15em] text-zinc-300 uppercase
                    transition-colors duration-150
                    hover:border-zinc-500 hover:bg-zinc-700/70 hover:text-white
                    active:scale-95
                  "
                  aria-label="Mark yourself as ready"
                >
                  {readyButtonLabel}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
