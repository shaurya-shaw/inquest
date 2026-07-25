"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

interface TypewriterProps {
  text: string;
  /** Milliseconds per character. Default: 30 */
  speed?: number;
  /** Called once all characters are revealed */
  onComplete?: () => void;
  /** When true, pauses the animation mid-stream */
  isPaused?: boolean;
  /**
   * Change this value to restart the animation from the beginning.
   * Useful for replay functionality.
   */
  restartKey?: number;
}

/**
 * A custom typewriter component — character-by-character reveal.
 * No external libraries. Implements pause/resume and restart.
 */
export default function Typewriter({
  text,
  speed = 30,
  onComplete,
  isPaused = false,
  restartKey = 0,
}: TypewriterProps) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep the callback ref up-to-date without restarting the animation
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset when text or restartKey changes
  useEffect(() => {
    setDisplayedCount(0);
    completedRef.current = false;
  }, [text, restartKey]);

  // Drive character reveal via setInterval
  useEffect(() => {
    if (isPaused) return;
    if (displayedCount >= text.length) return;

    const id = setInterval(() => {
      setDisplayedCount((prev) => {
        const next = prev + 1;
        if (next >= text.length) {
          clearInterval(id);
          if (!completedRef.current) {
            completedRef.current = true;
            // Defer callback to avoid state update during render
            setTimeout(() => onCompleteRef.current?.(), 0);
          }
        }
        return next;
      });
    }, speed);

    return () => clearInterval(id);
  }, [isPaused, displayedCount, text.length, speed]);

  const displayedText = text.slice(0, displayedCount);
  const isDone = displayedCount >= text.length;

  return (
    <span>
      {displayedText}
      {!isDone && (
        <span
          aria-hidden="true"
          className="ml-[1px] inline-block w-[2px] animate-[blink_1s_step-end_infinite] bg-current align-middle opacity-80"
        />
      )}
    </span>
  );
}
