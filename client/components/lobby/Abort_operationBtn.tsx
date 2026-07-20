"use client";
import { useRouter } from "next/navigation";

import { socket } from "@/lib/socket";
import { motion } from "motion/react";
import { useEffect } from "react";

export default function AbortOperationBtn() {
  const router = useRouter();

  useEffect(() => {
    socket.on("left-room", () => {
      router.push("/");
    });

    return () => {
      socket.off("left-room");
    };
  }, [router]);

  const handleAbortOperation = () => {
    socket.emit("leave-room");
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
