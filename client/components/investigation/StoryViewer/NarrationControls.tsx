"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { StoryPhase } from "./StoryController";

interface NarrationControlsProps {
  phase: StoryPhase;
  isMuted: boolean;
  onPause: () => void;
  onResume: () => void;
  onReplay: () => void;
  onMute: () => void;
  onUnmute: () => void;
}

/**
 * Floating bottom overlay with narration controls.
 * Fades in when the user moves their mouse; auto-hides after 3 seconds of inactivity.
 */
export default function NarrationControls({
  phase,
  isMuted,
  onPause,
  onResume,
  onReplay,
  onMute,
  onUnmute,
}: NarrationControlsProps) {
  const [visible, setVisible] = useState(true);

  const isPlaying = phase === "playing";
  const isInteractable = phase === "playing" || phase === "paused";

  if (!isInteractable) return null;

  return (
    <div
      className="absolute inset-x-0 bottom-8 z-50 flex justify-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(true)} // keep visible while hovered
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            key="narration-controls"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center gap-3 rounded-full border border-white/10 bg-black/70 px-5 py-3 shadow-2xl backdrop-blur-md"
            role="toolbar"
            aria-label="Narration controls"
          >
            {/* Pause / Resume */}
            <ControlButton
              id="narration-play-pause"
              onClick={isPlaying ? onPause : onResume}
              label={isPlaying ? "Pause narration" : "Resume narration"}
              icon={
                isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )
              }
            />

            {/* Divider */}
            <span className="h-4 w-px bg-white/20" aria-hidden="true" />

            {/* Replay */}
            <ControlButton
              id="narration-replay"
              onClick={onReplay}
              label="Replay current paragraph"
              icon={<RotateCcw className="h-4 w-4" />}
            />

            {/* Divider */}
            <span className="h-4 w-px bg-white/20" aria-hidden="true" />

            {/* Mute / Unmute */}
            <ControlButton
              id="narration-mute"
              onClick={isMuted ? onUnmute : onMute}
              label={isMuted ? "Unmute narration" : "Mute narration"}
              icon={
                isMuted ? (
                  <VolumeX className="h-4 w-4 text-red-400" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )
              }
            />

            {/* Status indicator */}
            <span className="h-4 w-px bg-white/20" aria-hidden="true" />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 select-none">
              {isMuted ? "muted" : isPlaying ? "narrating" : "paused"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ControlButtonProps {
  id: string;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}

function ControlButton({ id, onClick, label, icon }: ControlButtonProps) {
  return (
    <motion.button
      id={id}
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
      whileTap={{ scale: 0.9 }}
    >
      {icon}
    </motion.button>
  );
}
