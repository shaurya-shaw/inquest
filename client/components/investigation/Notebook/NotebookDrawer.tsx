"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DetectiveNotebook from "./DetectiveNotebook";

/**
 * Mobile-only notebook experience.
 *
 * Renders:
 * - A floating action button (📝) fixed to the bottom-right corner.
 * - When tapped, a bottom-sheet drawer slides up containing the full notebook.
 * - A semi-transparent backdrop dims the content behind the sheet.
 * - The sheet can be closed via the "×" button or by tapping the backdrop.
 *
 * This component is only mounted on small screens (hidden on md+).
 */
export default function NotebookDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ── Floating Action Button ─────────────────────────────────── */}
      <button
        id="notebook-drawer-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Open detective notebook"
        className="
          fixed bottom-24 right-4 z-30
          flex h-12 w-12 items-center justify-center
          rounded-full border border-zinc-700/60
          bg-[#0d0d0d] text-xl
          shadow-lg shadow-black/50
          transition-transform duration-150 active:scale-95
          md:hidden
        "
      >
        📝
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* ── Backdrop ──────────────────────────────────────────── */}
            <motion.div
              key="notebook-backdrop"
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* ── Bottom Sheet ───────────────────────────────────────── */}
            <motion.div
              key="notebook-drawer"
              className="
                fixed bottom-0 left-0 right-0 z-50
                flex flex-col
                rounded-t-2xl border-t border-zinc-800/60
                bg-[#0d0d0d]
                md:hidden
              "
              style={{ height: "75dvh" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              role="dialog"
              aria-modal="true"
              aria-label="Detective notebook"
            >
              {/* Drag handle + close button row */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                {/* Visual drag handle */}
                <div className="mx-auto h-1 w-10 rounded-full bg-zinc-700" />
              </div>

              {/* Close button */}
              <button
                id="notebook-drawer-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close notebook"
                className="
                  absolute right-3 top-3
                  flex h-7 w-7 items-center justify-center
                  rounded-full border border-zinc-700/50
                  bg-zinc-800/60 font-mono text-xs text-zinc-400
                  transition-colors hover:bg-zinc-700/60
                "
              >
                ×
              </button>

              {/* Notebook fills remaining drawer height */}
              <DetectiveNotebook className="mx-3 mb-3 flex-1 border-zinc-800/40" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
