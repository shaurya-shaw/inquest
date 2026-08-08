"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInterrogationStore } from "@/stores/interrogation-store";
import { socket } from "@/lib/socket";

/** Typewriter hook — reveals text character by character */
function useTypewriter(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayed("");
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      index++;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, isTyping };
}

/** A single suspect message with typewriter effect */
function SuspectBubble({ content, isLatest }: { content: string; isLatest: boolean }) {
  const suspectName = useInterrogationStore((s) => s.suspectName);
  const avatarUrl = useInterrogationStore((s) => s.avatarUrl);
  const { displayed, isTyping } = useTypewriter(
    content,
    isLatest ? 30 : 0, // only animate the latest message
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-2.5 max-w-[85%] self-start"
    >
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-700/50 bg-zinc-800/80 mt-1">
        {avatarUrl ? (
          <img src={avatarUrl} alt={suspectName ?? "Suspect"} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] font-bold text-zinc-400">
            {suspectName ? suspectName.charAt(0) : "S"}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[9px] uppercase tracking-[0.1em] text-zinc-600">
          {suspectName ?? "Suspect"}
        </span>
        <div className="rounded-xl rounded-tl-sm border border-zinc-800/50 bg-zinc-900/60 px-3.5 py-2.5">
          <p className="text-[13px] leading-relaxed text-zinc-300 whitespace-pre-wrap">
            {isLatest ? displayed : content}
            {isTyping && isLatest && (
              <span className="inline-block w-0.5 h-3.5 bg-zinc-400 ml-0.5 animate-pulse" />
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/** Player message bubble */
function PlayerBubble({ content, evidenceName }: { content: string; evidenceName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1 max-w-[85%] self-end items-end"
    >
      <span className="text-[9px] uppercase tracking-[0.1em] text-zinc-600">
        You
      </span>
      <div
        className={`rounded-xl rounded-tr-sm border px-3.5 py-2.5 ${
          evidenceName
            ? "border-amber-700/40 bg-amber-950/30"
            : "border-zinc-700/40 bg-zinc-800/50"
        }`}
      >
        {evidenceName && (
          <p className="text-[9px] uppercase tracking-[0.15em] text-amber-500/80 mb-1">
            📎 Presented: {evidenceName}
          </p>
        )}
        <p className="text-[13px] leading-relaxed text-zinc-200 whitespace-pre-wrap">
          {content}
        </p>
      </div>
    </motion.div>
  );
}

/** Typing indicator shown while waiting for suspect response */
function TypingIndicator() {
  const suspectName = useInterrogationStore((s) => s.suspectName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-2 self-start px-1"
    >
      <span className="text-[9px] uppercase tracking-[0.1em] text-zinc-600">
        {suspectName ?? "Suspect"} is thinking
      </span>
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1 w-1 rounded-full bg-zinc-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function ChatPanel() {
  const messages = useInterrogationStore((s) => s.messages);
  const isWaiting = useInterrogationStore((s) => s.isWaitingForResponse);
  const selectedEvidenceId = useInterrogationStore((s) => s.selectedEvidenceId);
  const suspectId = useInterrogationStore((s) => s.suspectId);
  const ended = useInterrogationStore((s) => s.interrogationEnded);
  const evidence = useInterrogationStore((s) => s.evidence);
  const addPlayerMessage = useInterrogationStore((s) => s.addPlayerMessage);
  const setWaitingForResponse = useInterrogationStore((s) => s.setWaitingForResponse);
  const selectEvidence = useInterrogationStore((s) => s.selectEvidence);
  const markEvidencePresented = useInterrogationStore((s) => s.markEvidencePresented);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isWaiting]);

  // Chat input is disabled when evidence is selected, waiting, or ended
  const isChatDisabled = !!selectedEvidenceId || isWaiting || ended;

  const selectedEvidenceName = selectedEvidenceId
    ? evidence.find((e) => e.id === selectedEvidenceId)?.name
    : null;

  const handleSendMessage = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || !suspectId || isChatDisabled) return;

    addPlayerMessage(trimmed);
    setWaitingForResponse(true);
    socket.emit("interrogate", { suspectId, message: trimmed });
    setInputValue("");
  }, [inputValue, suspectId, isChatDisabled, addPlayerMessage, setWaitingForResponse]);

  const handlePresentEvidence = useCallback(() => {
    if (!selectedEvidenceId || !suspectId) return;

    const evidenceItem = evidence.find((e) => e.id === selectedEvidenceId);
    const evidenceName = evidenceItem?.name ?? "evidence";

    addPlayerMessage(`[Shows evidence: ${evidenceName}]`, evidenceName);
    markEvidencePresented(selectedEvidenceId);
    setWaitingForResponse(true);
    socket.emit("interrogate", { suspectId, evidenceId: selectedEvidenceId });
  }, [selectedEvidenceId, suspectId, evidence, addPlayerMessage, markEvidencePresented, setWaitingForResponse]);

  const handleCancelEvidence = useCallback(() => {
    selectEvidence(null);
    inputRef.current?.focus();
  }, [selectEvidence]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex items-center border-b border-zinc-800/40 px-4 py-2.5">
        <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-500">
          Interrogation Room
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
        {messages.length === 0 && !isWaiting && (
          <div className="flex h-full items-center justify-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 text-center">
              Begin your interrogation.
              <br />
              Ask questions or present evidence.
            </p>
          </div>
        )}

        {messages.map((msg, idx) =>
          msg.role === "player" ? (
            <PlayerBubble
              key={msg.id}
              content={msg.content}
              evidenceName={msg.evidenceName}
            />
          ) : (
            <SuspectBubble
              key={msg.id}
              content={msg.content}
              isLatest={idx === messages.length - 1}
            />
          ),
        )}

        <AnimatePresence>
          {isWaiting && <TypingIndicator />}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Evidence confirmation bar */}
      <AnimatePresence>
        {selectedEvidenceId && !isWaiting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-amber-800/30 bg-amber-950/15 px-4 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-amber-200/80">
                Present <span className="font-semibold">{selectedEvidenceName}</span>?
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={handlePresentEvidence}
                  className="rounded-md border border-amber-600/50 bg-amber-900/40 px-3 py-1
                    text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-200
                    transition-colors hover:bg-amber-800/50"
                >
                  Confirm
                </button>
                <button
                  onClick={handleCancelEvidence}
                  className="rounded-md border border-zinc-700/50 bg-zinc-800/40 px-3 py-1
                    text-[10px] uppercase tracking-[0.1em] text-zinc-400
                    transition-colors hover:bg-zinc-700/40"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="border-t border-zinc-800/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isChatDisabled}
            placeholder={
              ended
                ? "Interrogation ended"
                : selectedEvidenceId
                  ? "Presenting evidence..."
                  : isWaiting
                    ? "Waiting for response..."
                    : "Ask a question..."
            }
            className={`
              flex-1 rounded-lg border px-3 py-2
              font-mono text-[12px] text-zinc-200
              outline-none transition-colors
              placeholder:text-zinc-600
              ${
                isChatDisabled
                  ? "cursor-not-allowed border-zinc-800/30 bg-zinc-900/20 text-zinc-600"
                  : "border-zinc-700/50 bg-zinc-900/60 focus:border-zinc-600"
              }
            `}
          />
          <button
            onClick={handleSendMessage}
            disabled={isChatDisabled || !inputValue.trim()}
            className={`
              rounded-lg border px-3 py-2
              text-[10px] font-semibold uppercase tracking-[0.1em]
              transition-colors
              ${
                isChatDisabled || !inputValue.trim()
                  ? "cursor-not-allowed border-zinc-800/30 bg-zinc-900/20 text-zinc-700"
                  : "border-zinc-600/50 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/60 hover:text-zinc-100"
              }
            `}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
