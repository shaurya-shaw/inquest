"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STATUS_MESSAGES = [
  "Establishing secure connection...",
  "Waking up the precinct...",
  "Initializing case files...",
  "Preparing interrogation rooms...",
  "Assembling evidence catalog...",
  "Almost there...",
];

const FINAL_MESSAGE = "Connection established. Opening case...";
const PROGRESS_DURATION_MS = 30_000;
const TIMEOUT_MS = 45_000;
const MESSAGE_INTERVAL_MS = 4_000;

interface ColdStartOverlayProps {
  visible: boolean;
  onTimeout: () => void;
  roomReady: boolean;
}

export default function ColdStartOverlay({
  visible,
  onTimeout,
  roomReady,
}: ColdStartOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completing, setCompleting] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible) {
      setMessageIndex(0);
      setProgress(0);
      setCompleting(false);
      return;
    }

    startTimeRef.current = Date.now();

    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, TIMEOUT_MS);

    messageIntervalRef.current = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, STATUS_MESSAGES.length - 1));
    }, MESSAGE_INTERVAL_MS);

    const TICK_MS = 100;
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
      const raw = elapsed / PROGRESS_DURATION_MS;
      const eased = 1 - Math.pow(1 - Math.min(raw, 1), 2);
      setProgress(Math.min(eased * 90, 90));
    }, TICK_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [visible, onTimeout]);

  useEffect(() => {
    if (!roomReady || !visible) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setCompleting(true);
    setProgress(100);
  }, [roomReady, visible]);

  const currentMessage = completing
    ? FINAL_MESSAGE
    : STATUS_MESSAGES[messageIndex] ?? STATUS_MESSAGES[0]!;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cold-start-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070709] select-none"
        >
          <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiBvcGFjaXR5PSIwLjEiLz4KPC9zdmc+')]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(80,10,10,0.35)_0%,rgba(5,5,5,0.98)_75%)]" />

          <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-10 px-8">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-px w-8 bg-red-800/60" />
                <span className="font-mono text-[9px] tracking-[0.4em] text-red-700/80 uppercase">
                  Secure Channel
                </span>
                <span className="h-px w-8 bg-red-800/60" />
              </div>
              <h1 className="font-serif text-4xl font-black uppercase tracking-[0.25em] text-zinc-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]">
                INQUEST
              </h1>
            </div>

            <div className="h-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentMessage}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                  className="font-mono text-xs tracking-[0.2em] text-zinc-400 text-center"
                >
                  {currentMessage}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="w-full flex flex-col gap-2">
              <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-red-700 shadow-[0_0_8px_rgba(185,28,28,0.7)]"
                  animate={{ width: `${progress}%` }}
                  transition={
                    completing
                      ? { duration: 0.5, ease: "easeOut" }
                      : { duration: 0.2, ease: "linear" }
                  }
                />
              </div>
              <div className="flex items-center justify-between font-mono text-[9px] tracking-widest text-zinc-600">
                <span>INITIALIZING</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1 w-1 rounded-full bg-red-800"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
