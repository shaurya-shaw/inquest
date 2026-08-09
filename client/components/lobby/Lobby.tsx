"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AbortOperationBtn from "./Abort_operationBtn";
import StartInvestigationBtn from "./StartInvestgationBtn";

interface Player {
  playerId: string;
  name: string;
  isHost?: boolean;
}

interface LobbyProps {
  caseId?: string;
  caseTitle?: string;
  players?: Player[];
  maxPlayers?: number;
  isHost?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.3,
    },
  },
};

const lineVariants = {
  hidden: { opacity: 0, x: -5 },
  show: {
    opacity: 1,
    x: 0,
    transition: { ease: "linear" as const, duration: 0.1 },
  },
};

export default function InvestigationLobby({
  caseId,
  caseTitle = "THE BLACKWOOD MANOR MURDER",
  players = [
    { playerId: "1", name: "Shaurya", isHost: true },
    { playerId: "2", name: "Rahul" },
  ],
  maxPlayers = 4,
  isHost = true,
}: LobbyProps) {
  const isDemo = maxPlayers === 1;
  const minRequired = isDemo ? 1 : 2;
  const emptySlots = Math.max(0, maxPlayers - players.length);
  const canStart = isHost && players.length >= minRequired;

  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = async () => {
    if (!caseId) return;
    try {
      await navigator.clipboard.writeText(caseId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy room ID", err);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-[#e8e8e8] font-mono p-6 md:p-7 selection:bg-red-900 selection:text-white">
      {/* Leave Button */}
      <AbortOperationBtn />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto flex flex-col gap-8 pt-10 sm:pt-0"
      >
        {/* Boot Sequence Log */}
        <div className="flex flex-col gap-1 text-neutral-500 text-xs sm:text-sm uppercase tracking-widest mt-8 sm:mt-0">
          <motion.div variants={lineVariants}>
            $ system_boot --secure
          </motion.div>
          <motion.div variants={lineVariants}>
            [ OK ] KERNEL INITIALIZED
          </motion.div>
          <motion.div variants={lineVariants}>
            [ OK ] ESTABLISHING SECURE UPLINK...
          </motion.div>
          <motion.div variants={lineVariants}>
            [ OK ] DECRYPTING CASE FILES...
          </motion.div>
          {isDemo && (
            <motion.div variants={lineVariants} className="text-amber-500 font-bold">
              [ OK ] DEMO MODE INITIALIZED — 1 DETECTIVE MATRIX
            </motion.div>
          )}
          <motion.div variants={lineVariants}>
            [ OK ] TERMINAL READY.
          </motion.div>
        </div>

        {/* Case Header */}
        <motion.div
          variants={lineVariants}
          className="border-t border-b border-neutral-800 py-6 my-4"
        >
          <div className="text-red-600 font-bold tracking-[0.4em] text-xs mb-3">
            :: CLASSIFIED OPERATION ::
          </div>
          <h1 className="text-2xl sm:text-4xl text-white tracking-widest uppercase mb-4">
            {caseTitle}
          </h1>

          {/* ROOM ID - prominently displayed with copy */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
            <span className="text-neutral-500 text-sm tracking-widest uppercase shrink-0">
              ROOM_ID //
            </span>
            <div className="flex rounded-md items-center border border-neutral-600 bg-neutral-950 px-3 py-2 gap-3 max-w-full">
              <span className="text-white font-mono text-base sm:text-lg tracking-[0.15em] select-all truncate">
                {caseId || "----------"}
              </span>
              <button
                onClick={handleCopyRoomId}
                disabled={!caseId}
                className="shrink-0 text-xs uppercase tracking-wider px-2 py-1 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 hover:bg-neutral-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {copied ? "[ COPIED ]" : "[ COPY ]"}
              </button>
            </div>
          </div>
          <div className="text-neutral-600 text-xs tracking-widest uppercase mt-2">
            SHARE THIS CODE WITH YOUR TEAM TO JOIN
          </div>
        </motion.div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm sm:text-base uppercase tracking-widest">
          {/* Investigators List */}
          <motion.div
            variants={containerVariants}
            className="flex flex-col gap-3"
          >
            <motion.div
              variants={lineVariants}
              className="text-neutral-600 mb-2"
            >
              --- PERSONNEL [{players.length}/{maxPlayers}] ---
            </motion.div>

            {players.map((player, index) => (
              <motion.div
                variants={lineVariants}
                key={player.playerId}
                className="flex items-center text-white"
              >
                <span className="text-neutral-500 mr-4">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{player.name}</span>
                {player.isHost && (
                  <span className="ml-3 text-red-600 text-xs border border-red-900 px-1">
                    OP_LEAD
                  </span>
                )}
                <span className="ml-auto text-neutral-400 text-xs">
                  [ ACTIVE ]
                </span>
              </motion.div>
            ))}

            {Array.from({ length: emptySlots }).map((_, i) => (
              <motion.div
                variants={lineVariants}
                key={`empty-${i}`}
                className="flex items-center text-neutral-700"
              >
                <span className="mr-4">
                  {String(players.length + i + 1).padStart(2, "0")}
                </span>
                <span>----------------</span>
                <span className="ml-auto text-xs animate-pulse">
                  [ AWAITING ]
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* System Parameters */}
          <motion.div
            variants={containerVariants}
            className="flex flex-col gap-3"
          >
            <motion.div
              variants={lineVariants}
              className="text-neutral-600 mb-2"
            >
              --- PARAMETERS ---
            </motion.div>

            <motion.div
              variants={lineVariants}
              className="flex justify-between border-b border-neutral-900 pb-2"
            >
              <span className="text-neutral-500">EST_DURATION</span>
              <span className="text-white">~10 MIN</span>
            </motion.div>
            <motion.div
              variants={lineVariants}
              className="flex justify-between border-b border-neutral-900 pb-2"
            >
              <span className="text-neutral-500">THREAT_LEVEL</span>
              <span className="text-red-500">ELEVATED</span>
            </motion.div>
            <motion.div
              variants={lineVariants}
              className="flex justify-between border-b border-neutral-900 pb-2"
            >
              <span className="text-neutral-500">SYS_STATUS</span>
              <span className="text-neutral-300 animate-pulse">STANDBY</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Action Button Segment */}
        <motion.div variants={lineVariants} className="mt-12">
          {isHost ? (
            canStart ? (
              <StartInvestigationBtn />
            ) : (
              <div className="w-full md:w-auto inline-flex items-center border border-neutral-900 p-4 text-neutral-600 cursor-not-allowed">
                <span className="mr-4 font-bold">{">"}</span>
                <span className="uppercase tracking-[0.2em]">
                  ERR: AWAITING_PERSONNEL (MIN {minRequired})
                </span>
                <span className="ml-4 w-3 h-5 bg-neutral-800 block animate-pulse" />
              </div>
            )
          ) : (
            <div className="w-full md:w-auto inline-flex items-center border border-neutral-900 p-4 text-neutral-500">
              <span className="mr-4 font-bold">{">"}</span>
              <span className="uppercase tracking-[0.2em]">
                AWAITING_OP_LEAD_EXECUTION...
              </span>
              <span className="ml-4 w-3 h-5 bg-neutral-700 block animate-pulse" />
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
