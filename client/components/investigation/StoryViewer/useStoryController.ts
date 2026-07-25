"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  StoryController,
  type StoryControllerState,
} from "./StoryController";

interface UseStoryControllerOptions {
  paragraphs: string[];
  /** Called when auto-scroll should occur (currentIndex changed while playing) */
  onIndexChange?: (index: number) => void;
}

interface UseStoryControllerReturn extends StoryControllerState {
  start: () => void;
  pause: () => void;
  resume: () => void;
  replay: () => void;
  mute: () => void;
  unmute: () => void;
  markTypewriterDone: () => void;
}

export function useStoryController({
  paragraphs,
  onIndexChange,
}: UseStoryControllerOptions): UseStoryControllerReturn {
  // Stable controller instance — never recreated
  const controllerRef = useRef<StoryController | null>(null);

  if (controllerRef.current === null) {
    controllerRef.current = new StoryController(paragraphs);
  }

  const controller = controllerRef.current;

  // Bridge the observer pattern to React's concurrent-safe external store hook
  const state = useSyncExternalStore(
    (listener) => controller.subscribe(listener),
    () => controller.getSnapshot(),
    () => controller.getSnapshot(), // server snapshot (same)
  );

  // Notify parent when currentIndex changes (for auto-scroll)
  const prevIndexRef = useRef<number>(-1);
  useEffect(() => {
    if (
      state.phase === "playing" &&
      state.currentIndex !== prevIndexRef.current
    ) {
      prevIndexRef.current = state.currentIndex;
      onIndexChange?.(state.currentIndex);
    }
  }, [state.currentIndex, state.phase, onIndexChange]);

  // Dispose on unmount
  useEffect(() => {
    return () => {
      controller.dispose();
    };
  }, [controller]);

  return {
    ...state,
    start: () => controller.start(),
    pause: () => controller.pause(),
    resume: () => controller.resume(),
    replay: () => controller.replay(),
    mute: () => controller.mute(),
    unmute: () => controller.unmute(),
    markTypewriterDone: () => controller.markTypewriterDone(),
  };
}
