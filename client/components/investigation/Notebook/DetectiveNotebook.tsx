"use client";

import { motion } from "framer-motion";
import { useNotebookStore } from "@/stores/notebook-store";
import NotebookHeader from "./NotebookHeader";
import NotebookTextarea from "./NotebookTextarea";
import NotebookFooter from "./NotebookFooter";

interface DetectiveNotebookProps {
  /** Extra Tailwind/CSS classes for positioning the container */
  className?: string;
}

export default function DetectiveNotebook({
  className,
}: DetectiveNotebookProps) {
  const notes = useNotebookStore((s) => s.notes);

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`
        flex flex-col overflow-hidden
        rounded-xl border border-zinc-800/60
        bg-[#0d0d0d] shadow-lg shadow-black/40
        ${className ?? ""}
      `}
      aria-label="Detective notebook panel"
      role="region"
    >
      <NotebookHeader />

      {/* Writing area — takes all available vertical space */}
      <NotebookTextarea className="flex-1" />

      <NotebookFooter characterCount={notes.length} />
    </motion.div>
  );
}
