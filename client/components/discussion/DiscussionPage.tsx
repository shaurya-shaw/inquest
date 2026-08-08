"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import DetectiveNotebook from "@/components/investigation/Notebook/DetectiveNotebook";
import NotebookDrawer from "@/components/investigation/Notebook/NotebookDrawer";
import VotingArea from "@/components/discussion/VotingArea";
import DiscussionTimer from "@/components/discussion/DiscussionTimer";
import { socket } from "@/lib/socket";
import { usePlayerStore } from "@/stores/player-store";
import { useRoomStore } from "@/stores/room-store";

interface DiscussionMessage {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  timestamp: number;
}

export default function DiscussionPage() {
  const { players } = useRoomStore();
  const { playerId, detectiveName } = usePlayerStore();
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleIncomingMessage = (message: DiscussionMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleHistory = (history: DiscussionMessage[]) => {
      setMessages(history);
    };

    socket.on("discussion-message", handleIncomingMessage);
    socket.on("discussion-history", handleHistory);

    return () => {
      socket.off("discussion-message", handleIncomingMessage);
      socket.off("discussion-history", handleHistory);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const activePlayers = useMemo(() => {
    return players.filter((player) => player.connected !== false);
  }, [players]);

  const handleSend = () => {
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    const payload: DiscussionMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      playerId,
      playerName: detectiveName || "You",
      content: trimmed,
      timestamp: Date.now(),
    };

    socket.emit("discussion-message", payload);
    setDraft("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    // Lock the screen height and prevent body scroll
    <div className="h-screen w-full bg-[#050505] p-3 text-zinc-100 sm:p-4 md:p-6 overflow-hidden">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-4 lg:flex-row">
        
        {/* Left Column: Chat */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-zinc-800/70 bg-[#080808]/95 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.45)] lg:w-1/2"
        >
          {/* Chat Header */}
          <div className="shrink-0 border-b border-zinc-800/70 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-red-500/80">
                  Team Chat
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-[0.12em] text-zinc-100">
                  Case Conference
                </h2>
              </div>
              <div className="rounded-full border border-red-900/30 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                {activePlayers.length} detectives online
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {activePlayers.map((player) => (
                <span
                  key={player.playerId}
                  className="rounded-full border border-zinc-800/70 bg-zinc-900/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400"
                >
                  {player.name || "Unknown Detective"}
                </span>
              ))}
            </div>
          </div>

          {/* Chat Messages - Flex-1 takes remaining space. Added classes to hide scrollbar. */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-800/80 bg-black/20 px-4 py-8 text-center">
                <p className="max-w-sm font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  Compare alibis, reconcile contradictions, and pin down the
                  truth before the room goes cold.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isSelf = message.playerId === playerId;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[85%] flex-col gap-1 ${isSelf ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                        {isSelf ? "You" : message.playerName}
                      </span>
                      <div
                        className={`rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                          isSelf
                            ? "border-red-900/30 bg-red-950/20 text-zinc-100"
                            : "border-zinc-800/70 bg-zinc-900/70 text-zinc-300"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {/* Chat Input */}
          <div className="shrink-0 border-t border-zinc-800/70 p-3 sm:p-4">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800/70 bg-black/30 p-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share a theory, clue, or suspicion..."
                className="flex-1 border-none bg-transparent px-2 py-1.5 font-mono text-[12px] text-zinc-200 outline-none placeholder:text-zinc-600"
              />
              <button
                onClick={handleSend}
                disabled={!draft.trim()}
                className="rounded-lg border border-zinc-700/70 bg-zinc-900/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:bg-zinc-800/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </motion.section>

        {/* Right Column: Tools */}
        <div className="flex h-full w-full flex-col gap-4 lg:w-1/2">
          
          {/* Timer - Always Visible, locked at top */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex shrink-0 justify-center"
          >
            <DiscussionTimer />
          </motion.div>

          {/* Desktop Layout: Notebook + Voting */}
          <div className="hidden min-h-0 flex-1 flex-col gap-4 md:flex">
            
            {/* Notebook - flex-1 allows it to take all remaining vertical space */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="min-h-0 flex-1 overflow-hidden"
            >
              <DetectiveNotebook className="h-full" />
            </motion.div>

            {/* Voting Area - Set to a fixed max-height or let it shrink, hiding its internal scrollbars here too */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="h-[260px] shrink-0 overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <VotingArea />
            </motion.div>
          </div>

          {/* Mobile Layout: Voting + Notebook Drawer */}
          <div className="flex min-h-0 flex-1 flex-col gap-3 md:hidden">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="min-h-0 flex-1 overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <VotingArea />
            </motion.div>
            <div className="shrink-0">
              <NotebookDrawer />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}