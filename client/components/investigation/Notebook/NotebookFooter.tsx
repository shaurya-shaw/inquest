"use client";

interface NotebookFooterProps {
  characterCount: number;
  className?: string;
}

export default function NotebookFooter({
  characterCount,
  className,
}: NotebookFooterProps) {
  return (
    <div
      className={`flex items-center justify-between border-t border-zinc-800/60 px-4 py-2 ${className ?? ""}`}
    >
      {/* Autosaved indicator */}
      <div className="flex items-center gap-1.5">
        {/* Subtle pulsing dot */}
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-600 opacity-50" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-zinc-500" />
        </span>
        <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-600 uppercase">
          Autosaved
        </span>
      </div>

      {/* Character count */}
      <span className="font-mono text-[9px] tracking-[0.15em] text-zinc-600">
        Characters:{" "}
        <span className="text-zinc-500">{characterCount.toLocaleString()}</span>
      </span>
    </div>
  );
}
