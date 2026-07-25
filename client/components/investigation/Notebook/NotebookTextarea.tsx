"use client";

import { useNotebookStore } from "@/stores/notebook-store";

const PLACEHOLDER = `Record observations...


Possible suspects...


Timeline...


Potential motives...


Questions to discuss...`;

interface NotebookTextareaProps {
  className?: string;
}

export default function NotebookTextarea({ className }: NotebookTextareaProps) {
  const notes = useNotebookStore((s) => s.notes);
  const setNotes = useNotebookStore((s) => s.setNotes);

  return (
    <textarea
      id="detective-notebook-textarea"
      className={`
        w-full flex-1 resize-none bg-transparent px-4 py-4
        font-mono text-sm leading-relaxed text-zinc-300
        placeholder:text-zinc-700
        focus:outline-none
        [scrollbar-color:theme(colors.zinc.700)_transparent]
        [scrollbar-width:thin]
        ${className ?? ""}
      `}
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      placeholder={PLACEHOLDER}
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      aria-label="Detective notebook — personal notes"
    />
  );
}
