"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoryController } from "./useStoryController";
import StoryParagraph from "./StoryParagraph";
import NarrationControls from "./NarrationControls";

interface StoryViewerProps {
  paragraphs: string[];
  caseTitle: string;
  caseId?: string;
  /** Called when the "Briefing Complete" screen has shown long enough to transition */
  onComplete?: () => void;
}

/**
 * Top-level Story Viewer.
 *
 * Phases:
 *  1. "idle"     → intro animation (case title card)
 *  2. "intro"    → transitioning (handled by AnimatePresence)
 *  3. "playing"  → paragraphs revealed one by one
 *  4. "paused"   → narration paused
 *  5. "complete" → "Briefing Complete" screen
 */
export default function StoryViewer({
  paragraphs,
  caseTitle,
  caseId,
  onComplete,
}: StoryViewerProps) {
  // Refs for the active paragraph (auto-scroll target)
  const activeParagraphRef = useRef<HTMLDivElement | null>(null);

  const handleIndexChange = useCallback((_index: number) => {
    requestAnimationFrame(() => {
      const el = activeParagraphRef.current;
      if (!el) return;

      // Anchor the top of the active paragraph to 50% of viewport height.
      // This keeps it comfortably above the fixed narration controls bar
      // (~80px tall + bottom-8 offset = ~112px from bottom).
      const targetFraction = 0.50;
      const rect = el.getBoundingClientRect();
      const desiredTop = window.innerHeight * targetFraction;
      const offset = rect.top + window.scrollY - desiredTop;

      window.scrollTo({ top: offset, behavior: "smooth" });
    });
  }, []);

  const {
    phase,
    currentIndex,
    revealedCount,
    isMuted,
    restartKey,
    start,
    pause,
    resume,
    replay,
    mute,
    unmute,
    markTypewriterDone,
  } = useStoryController({ paragraphs, onIndexChange: handleIndexChange });

  // Auto-trigger complete callback after showing "Briefing Complete" screen
  useEffect(() => {
    if (phase !== "complete") return;
    const id = setTimeout(() => {
      onComplete?.();
    }, 4500);
    return () => clearTimeout(id);
  }, [phase, onComplete]);

  const isPaused = phase === "paused";
  const isBodyVisible = phase === "playing" || phase === "paused";
  const isComplete = phase === "complete";
  const isIntro = phase === "idle";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070707]">
      {/* ── Ambient background texture ─────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(120,10,10,0.08),transparent)]"
      />

      {/* ── Case file watermark ────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-6 font-mono text-[10px] tracking-[0.3em] text-zinc-800 select-none"
      >
        {caseId ?? "CLASSIFIED"} // EYES ONLY
      </div>

      {/* ── INTRO PHASE ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isIntro && (
          <IntroCard
            key="intro"
            caseTitle={caseTitle}
            caseId={caseId}
            onFinished={start}
          />
        )}
      </AnimatePresence>

      {/* ── STORY BODY ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isBodyVisible && (
          <motion.main
            key="story-body"
            id="story-viewer-main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mx-auto flex min-h-screen max-w-2xl flex-col justify-start px-6 pb-64 pt-20 md:px-10 md:pt-28"
            aria-live="polite"
            aria-label="Investigation briefing"
          >
            {/* Paragraph index label */}
            <p className="mb-10 font-mono text-[9px] tracking-[0.3em] text-zinc-600 uppercase select-none">
              {caseId} &mdash; Briefing in progress
            </p>

            {/* Paragraphs */}
            {paragraphs.slice(0, revealedCount).map((text, i) => (
              <StoryParagraph
                key={i}
                text={text}
                paragraphIndex={i}
                currentIndex={currentIndex}
                isPaused={isPaused}
                restartKey={restartKey}
                onTypewriterComplete={
                  i === currentIndex ? markTypewriterDone : () => {}
                }
                scrollRef={
                  i === currentIndex
                    ? (activeParagraphRef as React.RefObject<HTMLDivElement | null>)
                    : undefined
                }
              />
            ))}
          </motion.main>
        )}
      </AnimatePresence>

      {/* ── COMPLETE PHASE ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isComplete && <CompleteScreen key="complete" />}
      </AnimatePresence>

      {/* ── NARRATION CONTROLS ─────────────────────────────────────── */}
      <NarrationControls
        phase={phase}
        isMuted={isMuted}
        onPause={pause}
        onResume={resume}
        onReplay={replay}
        onMute={mute}
        onUnmute={unmute}
      />
    </div>
  );
}

// ─── Intro Card ──────────────────────────────────────────────────────────────

interface IntroCardProps {
  caseTitle: string;
  caseId?: string;
  onFinished: () => void;
}

function IntroCard({ caseTitle, caseId, onFinished }: IntroCardProps) {
  useEffect(() => {
    // Hold for 3.8s then trigger story start
    const id = setTimeout(onFinished, 3800);
    return () => clearTimeout(id);
  }, [onFinished]);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#070707] px-8"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.0, ease: "easeInOut" }}
    >
      {/* Top accent line */}
      <motion.div
        className="mb-8 h-px w-24 bg-red-800/60"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{ transformOrigin: "left" }}
      />

      {/* Case label */}
      <motion.p
        className="mb-4 font-mono text-[9px] tracking-[0.5em] text-red-700/80 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        {caseId ?? "Classified"} &mdash; Case Briefing
      </motion.p>

      {/* Case title */}
      <motion.h1
        className="max-w-xl text-center font-serif text-3xl font-bold leading-snug tracking-wide text-[#f0ebe3] md:text-4xl lg:text-5xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.8, ease: "easeOut" }}
      >
        {caseTitle}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="mt-5 font-mono text-[10px] tracking-[0.35em] text-zinc-500 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.6 }}
      >
        Classified Briefing &mdash; Eyes Only
      </motion.p>

      {/* Bottom accent line */}
      <motion.div
        className="mt-8 h-px w-24 bg-red-800/60"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        style={{ transformOrigin: "right" }}
      />
    </motion.div>
  );
}

// ─── Complete Screen ─────────────────────────────────────────────────────────

function CompleteScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#070707] px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Pulsing accent dot */}
      <motion.div
        className="mb-8 h-2 w-2 rounded-full bg-red-700"
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.p
        className="mb-3 font-mono text-[9px] tracking-[0.5em] text-red-700/80 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Briefing Complete
      </motion.p>

      <motion.h2
        className="max-w-sm text-center font-serif text-2xl font-bold text-[#f0ebe3] md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
      >
        You have all the facts.
      </motion.h2>

      <motion.p
        className="mt-4 font-mono text-xs tracking-[0.25em] text-zinc-500 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        Proceeding to discussion&hellip;
      </motion.p>

      {/* Horizontal progress line */}
      <motion.div
        className="mt-10 h-px bg-red-800/50"
        initial={{ width: 0 }}
        animate={{ width: 160 }}
        transition={{ duration: 3.5, delay: 1.2, ease: "linear" }}
      />
    </motion.div>
  );
}
