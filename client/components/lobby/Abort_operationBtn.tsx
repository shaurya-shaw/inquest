"use client";

import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { clearGameSessionData } from "@/lib/session-cleanup";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function AbortOperationBtn() {
  const router = useRouter();

  useEffect(() => {
    const handleLeftRoom = () => {
      clearGameSessionData();
      router.push("/");
    };

    socket.on("left-room", handleLeftRoom);

    return () => {
      socket.off("left-room", handleLeftRoom);
    };
  }, [router]);

  const handleAbortOperation = () => {
    clearGameSessionData();
    router.push("/");
  };

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      onClick={handleAbortOperation}
      className="absolute top-6 right-6 md:top-7 md:right-7 z-10 text-red-600 border border-red-900/50 bg-black/50 px-3 py-2 text-xs sm:text-sm tracking-[0.2em] uppercase hover:bg-red-950/40 hover:text-red-500 hover:border-red-800 transition-colors focus:outline-none"
    >
      [ ABORT_OPERATION ]
    </motion.button>
  );
}
