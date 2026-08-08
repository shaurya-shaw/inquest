"use client";

import { useCaseStore } from "@/stores/case-store";
import { usePlayerStore } from "@/stores/player-store";
import { useRoomStore } from "@/stores/room-store";
import { socket } from "@/lib/socket";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export default function VotingArea() {
  const { suspects } = useCaseStore();
  const { playerId } = usePlayerStore();
  const { votedPlayers, players, playerVote } = useRoomStore();
  
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if current player has already voted (from server state)
  const currentPlayerVoted = votedPlayers?.includes(playerId) || hasVoted;

  // Sync hasVoted state when votedPlayers updates (handles reconnect)
  useEffect(() => {
    if (votedPlayers?.includes(playerId)) {
      setHasVoted(true);
    }
  }, [votedPlayers, playerId]);

  const handleSuspectClick = (suspectId: string) => {
    if (currentPlayerVoted) return;
    setSelectedSuspect(suspectId);
  };

  const handleConfirmVote = () => {
    if (!selectedSuspect || currentPlayerVoted || isSubmitting) return;

    setIsSubmitting(true);

    // Set up error handler for this specific vote submission
    const handleError = ({ message }: { message: string }) => {
      toast.error(message || "Failed to submit vote. Please try again.");
      setIsSubmitting(false);
      setSelectedSuspect(null);
    };

    socket.once("error", handleError);

    socket.emit("submit-vote", { suspectId: selectedSuspect });

    // Wait for vote-status-updated to confirm success
    const handleVoteSuccess = () => {
      const suspectName = suspects.find((s) => s.id === selectedSuspect)?.name;
      toast.success(`Vote recorded: ${suspectName}`, {
        description: "Your accusation has been submitted.",
      });
      setHasVoted(true);
      setIsSubmitting(false);
      socket.off("error", handleError);
    };

    socket.once("vote-status-updated", handleVoteSuccess);

    // Timeout fallback
    setTimeout(() => {
      socket.off("error", handleError);
      socket.off("vote-status-updated", handleVoteSuccess);
      if (isSubmitting) {
        setIsSubmitting(false);
      }
    }, 5000);
  };

  const handleCancelVote = () => {
    setSelectedSuspect(null);
  };

  // Keyboard handler for accessibility
  const handleKeyDown = (event: React.KeyboardEvent, suspectId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSuspectClick(suspectId);
    }
  };

  const connectedPlayers = useMemo(() => 
    players.filter((p) => p.connected), 
    [players]
  );
  const voteCount = votedPlayers?.length || 0;
  const totalPlayers = connectedPlayers.length;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/70 bg-[#080808]/95 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.45)]">
      {/* Header */}
      <div className="border-b border-zinc-800/70 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-red-500/80">
              Suspect Identification
            </p>
            <h3 className="mt-1 text-base font-semibold tracking-[0.12em] text-zinc-100">
              Cast Your Vote
            </h3>
          </div>
          <div className="rounded-full border border-red-900/30 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            {voteCount}/{totalPlayers} voted
          </div>
        </div>

        {/* Voter List */}
        {votedPlayers && votedPlayers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {votedPlayers.map((votedPlayerId) => {
              const player = players.find((p) => p.playerId === votedPlayerId);
              return (
                <span
                  key={votedPlayerId}
                  className="rounded-full border border-green-900/30 bg-green-950/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-green-400"
                >
                  {player?.name || "Unknown"} ✓
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Suspect Cards Grid - Added scrollbar hiding classes here */}
      <div className="flex-1 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {suspects.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-800/80 bg-black/20 px-4 py-8 text-center">
            <p className="max-w-sm font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              No suspects available. Please wait for case data to load.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {suspects.map((suspect) => {
            const isSelected = selectedSuspect === suspect.id;
            const isLocked = currentPlayerVoted && (hasVoted ? selectedSuspect === suspect.id : false);

            return (
              <motion.div
                key={suspect.id}
                onClick={() => handleSuspectClick(suspect.id)}
                onKeyDown={(e) => handleKeyDown(e, suspect.id)}
                tabIndex={currentPlayerVoted ? -1 : 0}
                role="button"
                aria-label={`Vote for ${suspect.name}`}
                aria-pressed={isSelected}
                aria-disabled={currentPlayerVoted}
                whileHover={!currentPlayerVoted ? { scale: 1.02 } : {}}
                whileTap={!currentPlayerVoted ? { scale: 0.98 } : {}}
                className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                  isLocked
                    ? "border-green-600/60 bg-green-950/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                    : isSelected
                      ? "border-red-600/60 bg-red-950/30 shadow-[0_0_20px_rgba(220,38,38,0.15)]"
                      : currentPlayerVoted
                        ? "border-zinc-800/50 bg-zinc-900/40 opacity-50 cursor-not-allowed"
                        : "border-zinc-800/70 bg-zinc-900/60 hover:border-zinc-700/80 hover:bg-zinc-900/80"
                }`}
              >
                {/* Profile Image Placeholder */}
                <div
                  className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 ${
                    isLocked
                      ? "border-green-600/40 bg-green-950/20"
                      : isSelected
                        ? "border-red-600/40 bg-red-950/20"
                        : "border-zinc-700/50 bg-zinc-800/50"
                  }`}
                >
                  <span className="text-2xl font-bold tracking-wider text-zinc-500">
                    {suspect.name.charAt(0)}
                  </span>
                </div>

                {/* Suspect Name */}
                <p
                  className={`text-center text-sm font-semibold tracking-wide ${
                    isLocked || isSelected ? "text-zinc-100" : "text-zinc-300"
                  }`}
                >
                  {suspect.name}
                </p>

                {/* Occupation */}
                <p className="mt-1 text-center text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                  {suspect.occupation}
                </p>

                {/* Locked indicator */}
                {isLocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-green-600 bg-green-950 shadow-lg"
                  >
                    <Check className="h-4 w-4 text-green-400" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
        )}
      </div>

      {/* Confirmation Panel */}
      <AnimatePresence>
        {selectedSuspect && !hasVoted && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="border-t border-zinc-800/70 bg-zinc-950/80 px-4 py-4 backdrop-blur-sm"
          >
            <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-zinc-400">
              Accuse{" "}
              <span className="font-semibold text-red-400">
                {suspects.find((s) => s.id === selectedSuspect)?.name}
              </span>
              ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancelVote}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-700/70 bg-zinc-900/70 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-300 transition-colors hover:bg-zinc-800/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleConfirmVote}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-700/70 bg-red-900/70 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-red-100 transition-colors hover:bg-red-800/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-300/30 border-t-red-300" />
                    Submitting
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked State Message */}
      {currentPlayerVoted && (
        <div className="border-t border-zinc-800/70 bg-green-950/10 px-4 py-3">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-green-400">
            ✓ Vote Recorded — Waiting for other detectives
          </p>
        </div>
      )}
    </div>
  );
}