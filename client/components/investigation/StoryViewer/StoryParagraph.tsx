"use client";

import { motion } from "framer-motion";
import Typewriter from "./Typewriter";

interface StoryParagraphProps {
  text: string;
  /** Index of this paragraph in the story array */
  paragraphIndex: number;
  /** Index of the currently-active paragraph */
  currentIndex: number;
  /** Called when typewriter animation finishes (only relevant for active paragraph) */
  onTypewriterComplete: () => void;
  /** Whether the story is paused */
  isPaused: boolean;
  /** Change to restart typewriter animation */
  restartKey: number;
  /** Forwarded ref for auto-scroll (only attached to the active paragraph) */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Renders a single story paragraph.
 *
 * - Active paragraph: full opacity, typewriter animation, larger emphasis
 * - Previous paragraph (1 behind): 50% opacity, instantly revealed
 * - Older paragraphs (2+ behind): 25% opacity, instantly revealed
 */
export default function StoryParagraph({
  text,
  paragraphIndex,
  currentIndex,
  onTypewriterComplete,
  isPaused,
  restartKey,
  scrollRef,
}: StoryParagraphProps) {
  const distance = currentIndex - paragraphIndex;
  const isActive = distance === 0;
  const isRecent = distance === 1;
  // distance >= 2 → older

  // Opacity tiers
  const targetOpacity = isActive ? 1 : isRecent ? 0.45 : 0.22;

  return (
    <motion.div
      ref={scrollRef}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: targetOpacity, y: 0 }}
      transition={{
        opacity: { duration: 0.7, ease: "easeOut" },
        y: { duration: 0.5, ease: "easeOut" },
        layout: { duration: 0.6, ease: "easeInOut" },
      }}
      className={[
        "mb-10 font-serif leading-relaxed tracking-wide",
        isActive
          ? "text-[1.15rem] text-[#f0ebe3] md:text-[1.25rem]"
          : "text-[1rem] text-[#d4cfc8] md:text-[1.1rem]",
      ].join(" ")}
    >
      {/* Subtle left accent line on the active paragraph */}
      {isActive && (
        <motion.span
          className="mr-4 inline-block h-full w-[2px] rounded-full bg-red-700/70 align-middle"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4 }}
          style={{ transformOrigin: "top" }}
          aria-hidden="true"
        />
      )}

      {isActive ? (
        <Typewriter
          text={text}
          speed={28}
          onComplete={onTypewriterComplete}
          isPaused={isPaused}
          restartKey={restartKey}
        />
      ) : (
        text
      )}
    </motion.div>
  );
}
