"use client";

import { motion } from "framer-motion";
import {
  useInterrogationStore,
  getComposureLabel,
  getTrustLabel,
  getPressureLabel,
} from "@/stores/interrogation-store";

const COMPOSURE_COLORS: Record<string, string> = {
  Composed: "text-emerald-400",
  Rattled: "text-amber-400",
  Breaking: "text-red-400",
};

const TRUST_COLORS: Record<string, string> = {
  Guarded: "text-sky-400/60",
  Cautious: "text-amber-400",
  "Opening up": "text-emerald-400",
};

const PRESSURE_COLORS: Record<string, string> = {
  Calm: "text-zinc-400",
  Tense: "text-amber-400",
  Cornered: "text-red-400",
};

export default function SuspectInfoBlock() {
  const suspectName = useInterrogationStore((s) => s.suspectName);
  const avatarUrl = useInterrogationStore((s) => s.avatarUrl);
  const trust = useInterrogationStore((s) => s.trust);
  const pressure = useInterrogationStore((s) => s.pressure);
  const composure = useInterrogationStore((s) => s.composure);

  const composureLabel = getComposureLabel(composure);
  const trustLabel = getTrustLabel(trust);
  const pressureLabel = getPressureLabel(pressure);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-start gap-3 rounded-xl border border-zinc-800/60 bg-[#0d0d0d] p-3"
    >
      {/* Portrait / Avatar */}
      <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-700/40 bg-zinc-900/80">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={suspectName ?? "Suspect"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-serif text-2xl text-zinc-600">
            {suspectName ? suspectName.charAt(0) : "?"}
          </span>
        )}
      </div>

      {/* Info + narrative labels */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Name + occupation */}
        <div>
          <h3 className="font-serif text-sm font-semibold text-[#f0ebe3] leading-tight">
            {suspectName ?? "Unknown"}
          </h3>
          <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">
            Suspect
          </p>
        </div>

        {/* Narrative feedback labels */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <NarrativeLabel
            label="Composure"
            value={composureLabel}
            colorClass={COMPOSURE_COLORS[composureLabel] ?? "text-zinc-400"}
          />
          <NarrativeLabel
            label="Trust"
            value={trustLabel}
            colorClass={TRUST_COLORS[trustLabel] ?? "text-zinc-400"}
          />
          <NarrativeLabel
            label="Pressure"
            value={pressureLabel}
            colorClass={PRESSURE_COLORS[pressureLabel] ?? "text-zinc-400"}
          />
        </div>
      </div>
    </motion.div>
  );
}

function NarrativeLabel({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] uppercase tracking-[0.1em] text-zinc-600">
        {label}:
      </span>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${colorClass}`}
      >
        {value}
      </motion.span>
    </div>
  );
}
