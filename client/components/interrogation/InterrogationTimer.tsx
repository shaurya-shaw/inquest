"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "@/lib/socket";
import { useRoomStore } from "@/stores/room-store";
import { usePlayerStore } from "@/stores/player-store";
import { useInterrogationStore } from "@/stores/interrogation-store";

const INTERROGATION_DURATION = 5 * 60; // 5 minutes in seconds

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

export default function InterrogationTimer() {
  const { phaseStartedAt, phaseDuration, readyPlayers, players, roomId, maxInvestigators, demoSuspectIndex } =
    useRoomStore();
  const { playerId } = usePlayerStore();
  const interrogationStartedAt = useInterrogationStore(
    (s) => s.interrogationStartedAt,
  );
  const ended = useInterrogationStore((s) => s.interrogationEnded);

  const isDemo = maxInvestigators === 1;
  const minTimeThreshold = isDemo ? 60 : 120; // 1 min threshold in Demo Mode, 2 min in normal

  const [remaining, setRemaining] = useState(INTERROGATION_DURATION);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isReady = playerId ? readyPlayers.includes(playerId) : false;

  useEffect(() => {
    const startTime = phaseStartedAt || interrogationStartedAt;
    const duration = phaseDuration || INTERROGATION_DURATION;

    if (!startTime || ended) return;

    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setRemaining(Math.max(0, duration - elapsed));
      setMinTimeElapsed(elapsed >= minTimeThreshold);
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phaseStartedAt, interrogationStartedAt, phaseDuration, ended, minTimeThreshold]);

  const handleReady = () => {
    if (!roomId || isReady || !minTimeElapsed) return;
    socket.emit("detective-ready");
  };

  const connectedCount = players.filter((p) => p.connected).length;
  const readyCount = readyPlayers.length;
  const isUrgent = remaining <= 30;
  const isLow = remaining <= 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 backdrop-blur-md shadow-lg font-mono"
    >
      {/* Top status bar: Timer & Ready count */}
      <div className="flex w-full items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs ${
              isUrgent ? "text-red-500 animate-pulse" : "text-zinc-400"
            }`}
          >
            ⏱
          </span>
          <span
            className={`font-semibold tabular-nums ${
              isUrgent
                ? "text-red-300 animate-pulse"
                : isLow
                  ? "text-amber-300"
                  : "text-zinc-200"
            }`}
          >
            {ended ? "0:00" : formatTime(remaining)}
          </span>
        </div>

        {/* Ready count / Suspect count */}
        <div className="text-[10px] tracking-wider text-zinc-500 uppercase font-bold">
          {isDemo ? (
            <span className="text-amber-400">
              DEMO: SUSPECT {(demoSuspectIndex ?? 0) + 1} / 2
            </span>
          ) : (
            <>
              <span className="text-zinc-300 font-bold">{readyCount}</span>
              {" / "}
              <span className="text-zinc-300">{connectedCount}</span> Ready
            </>
          )}
        </div>
      </div>

      {/* Ready Button — appears below evidence board after threshold */}
      <AnimatePresence>
        {minTimeElapsed && !ended && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full pt-1"
          >
            {isReady ? (
              <div className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/60 py-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                <span className="text-emerald-500 font-bold">✓</span> Waiting for transition...
              </div>
            ) : (
              <button
                onClick={handleReady}
                className="w-full rounded-lg border border-emerald-800/60 bg-emerald-950/40 py-2 text-[10px] font-bold tracking-widest text-emerald-300 uppercase transition-colors hover:border-emerald-600 hover:bg-emerald-900/60 hover:text-white active:scale-95 shadow-md"
              >
                {isDemo && (demoSuspectIndex ?? 0) === 0
                  ? "✓ Interrogate Suspect 2 ➔"
                  : "✓ Ready for Discussion ➔"}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
