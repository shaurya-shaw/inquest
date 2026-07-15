import { EncryptedText } from "@/components/ui/encrypted-text";

type AnimatedHeadingProps = {
  text: string;
  className?: string;
  revealDelayMs?: number;
  showCursor?: boolean;
};

export function AnimatedHeading({
  text,
  className = "",
  revealDelayMs = 50,
  showCursor = true,
}: AnimatedHeadingProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Terminal Prompt Indicator */}
      <span className="select-none font-mono text-xl font-medium text-red-900/60">
        &gt;
      </span>

      <h1 className="relative flex items-center">
        <EncryptedText
          text={text}
          // ENCRYPTED STATE: Looks like locked, corrupted, or classified data
          encryptedClassName="font-mono text-red-900/70 tracking-[0.2em] uppercase"
          // REVEALED STATE: Stark white with a subtle digital-blood glow
          revealedClassName="font-black text-zinc-100 tracking-[0.1em] uppercase [text-shadow:0_0_20px_rgba(220,38,38,0.5)] transition-all duration-700"
          revealDelayMs={revealDelayMs}
        />
      </h1>

      {/* Blinking Tech-Noir Cursor */}
      {showCursor && (
        <span className="mt-1 inline-block h-[0.8em] w-2.5 animate-pulse bg-red-600/80 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
      )}
    </div>
  );
}
