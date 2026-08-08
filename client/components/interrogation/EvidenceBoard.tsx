"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInterrogationStore } from "@/stores/interrogation-store";

export default function EvidenceBoard() {
  const evidence = useInterrogationStore((s) => s.evidence);
  const presentedIds = useInterrogationStore((s) => s.presentedEvidenceIds);
  const selectedId = useInterrogationStore((s) => s.selectedEvidenceId);
  const selectEvidence = useInterrogationStore((s) => s.selectEvidence);
  const isWaiting = useInterrogationStore((s) => s.isWaitingForResponse);
  const ended = useInterrogationStore((s) => s.interrogationEnded);

  const handleClick = (evidenceId: string) => {
    if (presentedIds.includes(evidenceId) || isWaiting || ended) return;

    if (selectedId === evidenceId) {
      selectEvidence(null);
    } else {
      selectEvidence(evidenceId);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-[12px] uppercase tracking-[0.25em] text-zinc-500">
        Evidence Board 
      </h4>
      <span className="text-zinc-300/20">(click to present evidence)</span>

      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[320px] pr-1 custom-scrollbar">
        <AnimatePresence>
          {evidence.map((item) => {
            const isPresented = presentedIds.includes(item.id);
            const isSelected = selectedId === item.id;

            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={!isPresented ? { scale: 0.98 } : undefined}
                onClick={() => handleClick(item.id)}
                disabled={isPresented || isWaiting || ended}
                className={`
                  group relative w-full rounded-lg border px-3 py-2.5 text-left
                  transition-all duration-200 outline-none
                  ${
                    isPresented
                      ? "cursor-not-allowed border-zinc-800/30 bg-zinc-900/20 opacity-40"
                      : isSelected
                        ? "border-amber-600/60 bg-amber-950/20 shadow-[0_0_12px_rgba(217,119,6,0.1)]"
                        : "cursor-pointer border-zinc-800/50 bg-zinc-900/40 hover:border-zinc-700/60 hover:bg-zinc-800/40"
                  }
                `}
                aria-label={
                  isPresented
                    ? `${item.name} — already presented`
                    : `Present ${item.name}`
                }
              >
                {/* Evidence name */}
                <p
                  className={`text-[11px] font-semibold leading-tight ${
                    isPresented
                      ? "text-zinc-600 line-through"
                      : isSelected
                        ? "text-amber-200"
                        : "text-zinc-300 group-hover:text-zinc-200"
                  }`}
                >
                  {item.name}
                </p>

                {/* Description preview */}
                <p
                  className={`mt-1 text-[10px] leading-relaxed line-clamp-2 ${
                    isPresented
                      ? "text-zinc-700"
                      : isSelected
                        ? "text-amber-200/60"
                        : "text-zinc-500"
                  }`}
                >
                  {item.description}
                </p>

                {/* Presented badge */}
                {isPresented && (
                  <span className="absolute right-2 top-2 text-[8px] uppercase tracking-[0.15em] text-zinc-600">
                    Presented
                  </span>
                )}

                {/* Selected glow */}
                {isSelected && (
                  <motion.div
                    layoutId="evidence-glow"
                    className="absolute inset-0 rounded-lg border border-amber-500/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {evidence.length === 0 && (
        <p className="text-[10px] text-zinc-600 italic">
          No evidence available
        </p>
      )}
    </div>
  );
}
