"use client";

interface NotebookHeaderProps {
  className?: string;
}

export default function NotebookHeader({ className }: NotebookHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between border-b border-zinc-800/60 px-4 py-3 ${className ?? ""}`}
    >
      {/* Title */}
      <div className="flex items-center gap-2">
        <span className="text-base" aria-hidden="true">
          📝
        </span>
        <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-300 uppercase">
          Detective Notebook
        </span>
      </div>

      {/* Private badge */}
      <span
        className="rounded-full border border-zinc-700/50 bg-zinc-800/50 px-2 py-0.5 font-mono text-[9px] tracking-[0.15em] text-zinc-500 uppercase"
        title="Your notes are private and never shared with other players"
      >
        Private
      </span>
    </div>
  );
}
