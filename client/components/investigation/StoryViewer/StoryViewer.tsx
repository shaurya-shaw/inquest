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
}: StoryViewerProps) {
  // Ref for the active paragraph (auto-scroll target)
  const activeParagraphRef = useRef<HTMLDivElement | null>(null);
  // Ref for the internal scroll container (replaces window scroll)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleIndexChange = useCallback((_index: number) => {
    requestAnimationFrame(() => {
      const el = activeParagraphRef.current;
      const container = scrollContainerRef.current;
      if (!el || !container) return;

      // Anchor the top of the active paragraph to 50% of the container height.
      // This keeps it comfortably above the narration controls bar.
      const targetFraction = 0.50;
      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const desiredTop = container.clientHeight * targetFraction;
      const offset = rect.top - containerRect.top + container.scrollTop - desiredTop;

      container.scrollTo({ top: offset, behavior: "smooth" });
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
  } = useStoryController({
    paragraphs,
    caseId,
    onIndexChange: handleIndexChange,
  });

  // No auto-transition here — the server's main timer is the sole source of truth.

  const isPaused = phase === "paused";
  const isBodyVisible = phase === "playing" || phase === "paused" || phase === "complete";
  const isIntro = phase === "idle";

  return (
    // h-full + flex-col: fills the parent column exactly, no window overflow
    <div className="relative flex h-full flex-col overflow-hidden bg-[#070707]">
      {/* ── Ambient background texture ─────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(120,10,10,0.08),transparent)]"
      />

      {/* ── Case file watermark ────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-6 z-20 font-mono text-[10px] tracking-[0.3em] text-zinc-800 select-none"
      >
        {caseId ?? "CLASSIFIED"} // EYES ONLY
      </div>

      {/* ── Top fade gradient — masks scrolled-away text ───────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-[#070707] via-[#070707]/70 to-transparent"
      />

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

      {/* ── STORY BODY (internal scroll container) ─────────────────── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <AnimatePresence>
          {isBodyVisible && (
            <motion.main
              key="story-body"
              id="story-viewer-main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mx-auto flex max-w-2xl flex-col justify-start px-6 pb-52 pt-20 md:px-10 md:pt-28"
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
      </div>

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


