"use client";

import { motion } from "framer-motion";

interface Player {
  id: string;
  name: string;
  isHost?: boolean;
}

interface LobbyProps {
  caseId?: string;
  caseTitle?: string;
  players?: Player[];
  maxPlayers?: number;
  isHost?: boolean;
  onStart?: () => void;
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
    transition: { ease: "linear", duration: 0.1 },
  },
};

export default function InvestigationLobby({
  caseId = "A-284",
  caseTitle = "THE BLACKWOOD MANOR MURDER",
  players = [
    { id: "1", name: "Shaurya", isHost: true },
    { id: "2", name: "Rahul" },
  ],
  maxPlayers = 4,
  isHost = true,
  onStart,
}: LobbyProps) {
  const emptySlots = maxPlayers - players.length;
  const canStart = isHost && players.length >= 2;

  return (
    <div className="min-h-screen bg-black text-[#e8e8e8] font-mono p-6 md:p-7 selection:bg-red-900 selection:text-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto flex flex-col gap-8"
      >
        {/* Boot Sequence Log */}
        <div className="flex flex-col gap-1 text-neutral-500 text-xs sm:text-sm uppercase tracking-widest">
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
          <h1 className="text-2xl sm:text-4xl text-white tracking-widest uppercase mb-2">
            {caseTitle}
          </h1>
          <div className="text-neutral-500 text-sm tracking-widest uppercase">
            FILE.REF // {caseId}
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
                key={player.id}
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
              <span className="text-white">~30 MIN</span>
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
              <button
                onClick={onStart}
                className="group w-full md:w-auto flex items-center border border-neutral-700 p-4 hover:bg-white hover:text-black transition-none focus:outline-none"
              >
                <span className="text-red-600 mr-4 group-hover:text-black font-bold">
                  {">"}
                </span>
                <span className="uppercase tracking-[0.2em] font-bold">
                  [ START_INVESTIGATION ]
                </span>
                <span className="ml-4 w-3 h-5 bg-white group-hover:bg-black block animate-pulse" />
              </button>
            ) : (
              <div className="w-full md:w-auto inline-flex items-center border border-neutral-900 p-4 text-neutral-600 cursor-not-allowed">
                <span className="mr-4 font-bold">{">"}</span>
                <span className="uppercase tracking-[0.2em]">
                  ERR: AWAITING_PERSONNEL (MIN 2)
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
