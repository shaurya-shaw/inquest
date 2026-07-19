"use client";

import { useState, useEffect } from "react";
import { Archive, ScanBarcode, Fingerprint } from "lucide-react";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { RoomState, useRoomStore } from "@/stores/room-store";
import { usePlayerStore } from "@/stores/player-store";

export default function AccessCaseDossier() {
  const [isGranted, setIsGranted] = useState(false);
  const [detectiveName, setDetectiveName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const router = useRouter();
  const { updatePlayer } = usePlayerStore();
  const { updateRoom } = useRoomStore();

  useEffect(() => {
    const handlePlayerJoined = (room: RoomState) => {
      console.log("Successfully joined room:", room);
      updatePlayer({
        roomId: room.roomId,
        detectiveName,
        socketId: room.hostId,
        isHost: false,
      });

      updateRoom(room);

      setTimeout(() => {
        router.push(`/investigation/${room.roomId}`);
      }, 600);
    };

    socket.on("player-joined", handlePlayerJoined);

    socket.on("error", ({ message }) => {
      console.error("Error joining room:", message);
      // Handle error (e.g., show a notification to the user)
    });

    return () => {
      socket.off("player-joined");
      socket.off("error");
    };
  }, [router]);

  const handleAccessCase = () => {
    setIsGranted(true);
    // Add logic here to validate the code and navigate to the lobby
    socket.emit("join-room", { roomId: accessCode, name: detectiveName });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 font-serif selection:bg-zinc-800 selection:text-white">
      {/* ENVIRONMENTAL LIGHTING & BACKGROUND
        Cold overhead spotlight on a dark matte steel table 
      */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,55,60,0.8)_0%,rgba(5,5,5,1)_70%)]" />

      {/* OUT OF FOCUS ARCHIVE PROPS
        Simulates stacked confidential folders, evidence string, and old photos in the periphery
      */}
      <div className="pointer-events-none absolute left-[5%] top-[10%] h-72 w-56 -rotate-6 bg-[#dbccb5] opacity-[0.03] blur-[5px] shadow-2xl" />
      <div className="pointer-events-none absolute bottom-[5%] right-[10%] h-48 w-72 rotate-12 bg-white opacity-[0.02] blur-[8px]" />
      <div className="pointer-events-none absolute left-[80%] top-[20%] h-96 w-2 bg-red-900 opacity-[0.05] blur-[3px] rotate-45" />

      {/* THE DOSSIER (USED MANILA FOLDER) */}
      <div className="relative z-10 w-full max-w-2xl rounded-[2px] bg-[#d3c5ad] px-8 py-12 text-zinc-900 shadow-[0_30px_60px_rgba(0,0,0,0.95),inset_0_0_100px_rgba(120,100,70,0.5)] sm:px-16 sm:py-16">
        {/* SVG Paper Texture & Grain */}
        <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiBvcGFjaXR5PSIwLjEiLz4KPC9zdmc+')]"></div>

        {/* Realistic Coffee Stain Ring */}
        <div className="pointer-events-none absolute -right-12 top-24 h-48 w-48 rounded-full bg-[radial-gradient(circle,transparent_55%,rgba(90,60,30,0.15)_60%,transparent_65%)] mix-blend-multiply opacity-70 blur-[1px]" />

        {/* Subtle Smudged Fingerprint */}
        <div className="absolute bottom-40 left-10 text-zinc-800/10 rotate-[35deg] pointer-events-none">
          <Fingerprint className="h-24 w-24" />
        </div>

        {/* Archival Header Stamps */}
        <div className="mb-10 flex items-start justify-between font-mono text-xs font-bold tracking-widest text-zinc-800/70">
          <div className="flex flex-col space-y-1">
            <span className="border-2 border-zinc-800/50 px-2 py-1 uppercase line-through decoration-zinc-800/40">
              Active Case
            </span>
            <span className="border-2 border-red-900/40 px-2 py-1 uppercase text-red-900/70">
              Archive Div.
            </span>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <ScanBarcode className="h-8 w-24 opacity-50" />
            <span>REF: ARC-119-X</span>
          </div>
        </div>

        {/* TITLE SECTION */}
        <div className="mb-12 border-b-2 border-zinc-800/30 pb-8 text-center">
          <h1 className="font-serif text-4xl font-black uppercase tracking-[0.15em] text-zinc-900 sm:text-5xl">
            Access Case File
          </h1>
          <p className="mx-auto mt-4 max-w-sm font-mono text-sm leading-relaxed text-zinc-700">
            Authenticate your investigation credentials and join an active
            classified case.
          </p>
        </div>

        {/* FORM FIELDS */}
        <div className="space-y-10 font-mono">
          <div className="group relative">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-600">
              Detective Name
            </label>
            <input
              type="text"
              value={detectiveName}
              onChange={(e) => setDetectiveName(e.target.value)}
              className="w-full bg-transparent pb-2 text-lg text-zinc-900 placeholder-zinc-400 border-b-2 border-zinc-800/50 focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div className="group relative">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-600">
              Case Access Code
            </label>
            <input
              type="text"
              placeholder="ENTER 6-DIGIT CODE"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              className="w-full bg-transparent pb-2 text-lg uppercase tracking-widest text-zinc-900 placeholder-zinc-800/30 border-b-2 border-zinc-800/50 focus:border-zinc-900 focus:outline-none"
              maxLength={6}
            />
          </div>
        </div>

        {/* PRINTED ACCESS NOTICE */}
        <div className="mt-12 border-2 border-zinc-800/40 p-5 relative">
          <span className="absolute -top-3 left-4 bg-[#d3c5ad] px-2 font-mono text-xs font-bold tracking-widest text-zinc-700">
            ACCESS NOTICE
          </span>
          <p className="font-mono text-xs leading-relaxed text-zinc-700/90 text-justify">
            Only detectives possessing a valid investigation code may access an
            active case file. Unauthorized access is strictly prohibited under
            Federal Directive 89-B. Logging protocol initiated.
          </p>
        </div>

        <div className="my-10 h-px w-full bg-zinc-800/20" />

        {/* BOTTOM ACTION SECTION */}
        <div className="relative mt-8 flex flex-col items-center justify-between gap-8 sm:flex-row sm:gap-4">
          {/* Stamps Area */}
          <div className="flex w-full items-center gap-4 sm:w-auto">
            {/* Faded Archived Stamp */}
            <div className="rotate-[-5deg] rounded border-4 border-zinc-800/30 px-3 py-1 font-serif text-xl font-black uppercase tracking-widest text-zinc-800/30 mix-blend-multiply">
              ARCHIVED
            </div>

            {/* Empty Authorization Area -> Animates on Click */}
            <div className="relative h-16 w-40 border-2 border-dashed border-zinc-800/20 flex items-center justify-center rounded-sm">
              {!isGranted && (
                <span className="font-mono text-[10px] tracking-widest text-zinc-800/40 uppercase text-center">
                  Auth Stamp
                  <br />
                  Required
                </span>
              )}

              {isGranted && (
                <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in spin-in-[15deg] duration-300">
                  <span className="rotate-[-8deg] rounded border-4 border-red-700 px-3 py-1 font-serif text-xl font-black uppercase tracking-widest text-red-700 opacity-90 mix-blend-multiply">
                    GRANTED
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Brushed Steel Access Button */}
          <button
            onClick={handleAccessCase}
            className="group relative flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded bg-zinc-900 px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.2em] text-zinc-300 shadow-[0_5px_15px_rgba(0,0,0,0.6)] transition-all hover:text-white active:scale-95 active:shadow-none"
          >
            {/* Crimson edge rim lighting */}
            <div className="absolute inset-0 border border-red-900/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[inset_0_0_20px_rgba(220,38,38,0.25)]" />

            {/* Brushed metal grain */}
            <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiBvcGFjaXR5PSIwLjEiLz4KPC9zdmc+')]"></div>

            <Archive className="relative z-10 h-4 w-4 text-zinc-500 transition-colors group-hover:text-red-500" />
            <span className="relative z-10">Access Case</span>
          </button>
        </div>
      </div>
    </div>
  );
}
