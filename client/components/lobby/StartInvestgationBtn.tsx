"use client";
import { socket } from "@/lib/socket";

export default function StartInvestigationBtn() {
  const onStart = () => {
    socket.emit("start-investigation");
    console.log("Investigation started!");
  };
  return (
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
  );
}
