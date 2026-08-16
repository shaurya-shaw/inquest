"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface HowToInvestigateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToInvestigateModal({
  isOpen,
  onClose,
}: HowToInvestigateModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleProceed = () => {
    onClose();
    router.push("/investigation");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Dark Blurred Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", stiffness: 320, damping: 25 }}
          className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar rounded-xl border border-red-900/50 bg-[#0d0d11] p-6 text-zinc-100 shadow-[0_25px_70px_rgba(0,0,0,0.95)] sm:p-8 font-serif"
        >
          {/* Top Crimson Bevel Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-950 via-red-600 to-red-950" />

          {/* Close Button (Top Right Cross Icon) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal Header */}
          <div className="mb-6 border-b border-zinc-800/80 pb-4 text-center">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-red-500/90">
              Field Protocol Guide
            </span>
            <h2 className="mt-1 font-serif text-2xl font-black uppercase tracking-[0.18em] text-zinc-100 sm:text-3xl">
              How To Investigate
            </h2>
          </div>

          {/* 4 Investigation Steps */}
          <div className="space-y-3.5 font-serif">
            {/* Step 1 */}
            <div className="flex gap-4 items-start rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3.5">
              <span className="font-mono text-sm font-black text-red-500 tracking-widest shrink-0 mt-0.5">
                01
              </span>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-200">
                  INVESTIGATE
                </h4>
                <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed font-sans">
                  Examine the case and uncover clues.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3.5">
              <span className="font-mono text-sm font-black text-red-500 tracking-widest shrink-0 mt-0.5">
                02
              </span>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-200">
                  INTERROGATE
                </h4>
                <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed font-sans">
                  Question your assigned AI suspect. Their answers may change
                  under pressure or when confronted with evidence.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3.5">
              <span className="font-mono text-sm font-black text-red-500 tracking-widest shrink-0 mt-0.5">
                03
              </span>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-200">
                  DISCUSS
                </h4>
                <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed font-sans">
                  Share discoveries with your team and build your theory.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-3.5">
              <span className="font-mono text-sm font-black text-red-500 tracking-widest shrink-0 mt-0.5">
                04
              </span>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-200">
                  ACCUSE
                </h4>
                <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed font-sans">
                  Vote for the suspect you believe committed the murder.
                </p>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="mt-5 rounded-lg border border-red-900/50 bg-red-950/30 p-3.5 text-xs text-red-200/90 font-mono">
            <div className="flex items-center gap-2 font-bold text-red-400 uppercase tracking-wider mb-1">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <span>NO SINGLE SUSPECT TELLS THE WHOLE STORY.</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed pl-6">
              The truth only emerges when you compare what you learn.
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <button
              onClick={handleProceed}
              className="w-full flex items-center justify-center gap-2.5 rounded bg-gradient-to-b from-[#6d1010] via-[#4d0808] to-[#220202] border border-red-800/80 py-3.5 px-6 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg transition-all hover:border-red-600 hover:shadow-red-950/60 active:scale-[0.98] cursor-pointer"
            >
              <span>PROCEED TO CASE</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
