"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { socket } from "@/lib/socket";
import { useInterrogationStore } from "@/stores/interrogation-store";
import DetectiveNotebook from "@/components/investigation/Notebook/DetectiveNotebook";
import NotebookDrawer from "@/components/investigation/Notebook/NotebookDrawer";
import ChatPanel from "./ChatPanel";
import SuspectInfoBlock from "./SuspectInfoBlock";
import EvidenceBoard from "./EvidenceBoard";
import InterrogationTimer from "./InterrogationTimer";

export default function InterrogationPage() {
  const suspectId = useInterrogationStore((s) => s.suspectId);
  const setSuspectAssignment = useInterrogationStore(
    (s) => s.setSuspectAssignment,
  );
  const addSuspectMessage = useInterrogationStore((s) => s.addSuspectMessage);
  const updateMetrics = useInterrogationStore((s) => s.updateMetrics);
  const startTimer = useInterrogationStore((s) => s.startTimer);
  const endInterrogation = useInterrogationStore((s) => s.endInterrogation);
  const resetInterrogation = useInterrogationStore((s) => s.resetInterrogation);

  const restoreInterrogation = useInterrogationStore(
    (s) => s.restoreInterrogation,
  );

  // Socket event listeners
  useEffect(() => {
    const handleAssignment = (data: {
      suspectId: string;
      suspectName: string;
      avatarUrl?: string;
      evidence: Array<{ id: string; name: string; description: string }>;
    }) => {
      resetInterrogation();
      setSuspectAssignment(data);
      startTimer();
    };

    const handleRestore = (data: {
      suspectId: string;
      trust: number;
      pressure: number;
      composure: number;
      evidencePresented: string[];
      messages: Array<{ role: "player" | "suspect"; content: string }>;
    }) => {
      restoreInterrogation(data);
      startTimer();
    };

    const handleResponse = (data: { message: string; suspectId: string }) => {
      addSuspectMessage(data.message);
    };

    const handleStateUpdate = (data: {
      suspectId: string;
      trust: number;
      pressure: number;
      composure: number;
    }) => {
      updateMetrics(data.trust, data.pressure, data.composure);
    };

    const handleEnded = () => {
      endInterrogation();
    };

    socket.on("suspect-assignment", handleAssignment);
    socket.on("interrogation-state-restore", handleRestore);
    socket.on("interrogation-response", handleResponse);
    socket.on("suspect-state-update", handleStateUpdate);
    socket.on("interrogation-ended", handleEnded);

    return () => {
      socket.off("suspect-assignment", handleAssignment);
      socket.off("interrogation-state-restore", handleRestore);
      socket.off("interrogation-response", handleResponse);
      socket.off("suspect-state-update", handleStateUpdate);
      socket.off("interrogation-ended", handleEnded);
    };
  }, [
    setSuspectAssignment,
    restoreInterrogation,
    addSuspectMessage,
    updateMetrics,
    startTimer,
    endInterrogation,
  ]);

  // Loading state — waiting for suspect assignment
  if (!suspectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070707]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="h-px w-12 bg-red-800/50" />
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-500 animate-pulse">
            Assigning suspect&hellip;
          </p>
          <div className="h-px w-12 bg-red-800/50" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070707]">
      {/* ── LEFT: Chat Panel (45%) ─────────────────────────────────────── */}
      <div className="flex h-full w-full flex-col md:w-[45%]">
        <ChatPanel />
      </div>

      {/* ── CENTER-RIGHT: Suspect Info + Evidence Board + Timer (30%) ──── */}
      <div className="hidden h-full md:flex md:w-[30%] md:flex-col md:gap-3 md:border-l md:border-zinc-800/30 md:p-3">
        <SuspectInfoBlock />
        <div className="flex-1 overflow-hidden">
          <EvidenceBoard />
        </div>
        <InterrogationTimer />
      </div>

      {/* ── FAR RIGHT: Detective Notes (25%) ──────────────────────────── */}
      <div className="hidden h-full md:flex md:w-[25%] md:flex-col md:border-l md:border-zinc-800/30 md:p-2">
        <DetectiveNotebook className="flex-1" />
      </div>

      {/* ── Mobile: floating notes drawer ──────────────────────────────── */}
      <NotebookDrawer />
    </div>
  );
}
