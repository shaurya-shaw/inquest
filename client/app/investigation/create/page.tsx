"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Paperclip, ScanBarcode } from "lucide-react";
import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "@/stores/player-store";
import { RoomState, useRoomStore } from "@/stores/room-store";
import { useNotebookStore } from "@/stores/notebook-store";

export default function CreateCaseDossier() {
  const [investigators, setInvestigators] = useState(4);
  const [isClassified, setIsClassified] = useState(false);
  const [isChapterOpen, setIsChapterOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<{ label: string; id: string }>({
    label: "The Last Call",
    id: "the-last-call",
  });
  const [detectiveName, setDetectiveName] = useState("");
  const chapterDropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { playerId, updatePlayer } = usePlayerStore();
  const { updateRoom } = useRoomStore();
  const { clearNotes } = useNotebookStore();

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        chapterDropdownRef.current &&
        !chapterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsChapterOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    const handleRoomCreated = (room: RoomState) => {
      clearNotes();
      updatePlayer({
        roomId: room.roomId,
        detectiveName,
        playerId,
        isHost: true,
      });

      updateRoom(room);

      setTimeout(() => {
        router.push(`/investigation/${room.roomId}`);
      }, 600);
    };

    socket.on("room-created", handleRoomCreated);

    return () => {
      socket.off("room-created", handleRoomCreated);
    };
  }, [router, detectiveName, playerId, updatePlayer, updateRoom]);

  const handleCreateCase = () => {
    setIsClassified(true);
    console.log("clicked");
    // Add logic here to submit the form/navigate after the stamp animation
    socket.emit("create-room", {
      name: detectiveName,
      maxInvestigators: investigators,
      caseId: selectedCase.id,
      playerId,
    });
  };

  return (
    <div
      className="relative flex h-dvh items-start justify-center overflow-y-auto bg-[#0a0a0a] p-4 font-serif selection:bg-zinc-800 selection:text-white"
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
    >
      {/* ENVIRONMENTAL LIGHTING & BACKGROUND
        Simulates the "cold overhead spotlight" on a dark matte steel table 
      */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,65,70,0.8)_0%,rgba(5,5,5,1)_70%)]" />

      {/* OUT OF FOCUS BACKGROUND ELEMENTS
        Simulates the blurry fingerprint cards and polaroids around the edges
      */}
      <div className="pointer-events-none absolute left-[10%] top-[15%] h-64 w-48 -rotate-12 bg-[#e6d8c3] opacity-[0.03] blur-xs" />
      <div className="pointer-events-none absolute bottom-[10%] right-[15%] h-40 w-64 rotate-6 bg-white opacity-[0.02] blur-[6px]" />

      {/* THE DOSSIER (MANILA FOLDER)
        Uses multiple shadows to give it 3D thickness on the table
      */}
      <div className="relative z-10 my-4 w-full max-w-2xl rounded-xs bg-[#e1d5c0] px-8 py-12 text-zinc-900 shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_0_80px_rgba(150,130,100,0.4)] sm:px-16 sm:py-16">
        {/* Subtle Paper Texture Overlay (Using standard CSS noise/gradients) */}
        <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiBvcGFjaXR5PSIwLjEiLz4KPC9zdmc+')]"></div>

        {/* Physical Details: Metal Paperclip */}
        <div className="absolute -top-4 left-12 rotate-15 text-zinc-400 drop-shadow-md">
          <Paperclip className="h-16 w-16 stroke-[1.5]" />
        </div>

        {/* Header Stamps & Government Markings */}
        <div className="mb-10 flex items-start justify-between font-mono text-xs font-bold tracking-widest text-zinc-800/60">
          <div className="flex flex-col space-y-1">
            <span className="border-2 border-zinc-800/40 px-2 py-1 uppercase">
              Dept. of Justice
            </span>
            <span>FORM 404-B</span>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <ScanBarcode className="h-8 w-24 opacity-60" />
            <span>ID: 883-991-A</span>
          </div>
        </div>

        {/* TITLE SECTION */}
        <div className="mb-12 border-b-2 border-zinc-800/30 pb-8 text-center">
          <h1 className="font-serif text-4xl font-black uppercase tracking-[0.15em] text-zinc-900 sm:text-5xl">
            Create Investigation
          </h1>
          <p className="mx-auto mt-4 max-w-sm font-mono text-sm leading-relaxed text-zinc-700">
            &quot;Assemble your investigation team and uncover the truth by
            interrogating suspects.&quot;
          </p>
        </div>

        {/* FORM FIELDS (Integrated into the paper) */}
        <div className="space-y-10 font-mono">
          {/* Detective Name */}
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

          {/* Case Chapter */}
          <div className="group relative" ref={chapterDropdownRef}>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-600">
              Case Chapter
            </label>
            <button
              type="button"
              onClick={() => setIsChapterOpen((current) => !current)}
              className="flex w-full items-center justify-between border-b-2 border-zinc-800/50 bg-transparent pb-2 text-left text-lg text-zinc-900 transition-colors hover:border-zinc-900 focus:border-zinc-900 focus:outline-none"
            >
              <span>{selectedCase.label}</span>
              <ChevronDown
                className={`h-4 w-4 text-zinc-700 transition-transform duration-200 ${
                  isChapterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isChapterOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-sm border border-zinc-800/30 bg-[#e1d5c0] shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                {([
                  { label: "The Last Call", id: "the-last-call" },
                ] as { label: string; id: string }[]).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCase(c);
                      setIsChapterOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left font-mono text-sm text-zinc-900 transition-colors hover:bg-zinc-900/10"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Maximum Investigators (Ink Circle style) */}
          <div className="pt-4">
            <label className="mb-4 block text-xs font-bold uppercase tracking-widest text-zinc-600">
              Maximum Investigators
            </label>
            <div className="flex gap-8">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setInvestigators(num)}
                  className="flex items-center gap-3 text-lg text-zinc-800"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                      investigators === num
                        ? "border-zinc-900 bg-zinc-900"
                        : "border-zinc-400 bg-transparent"
                    }`}
                  >
                    {investigators === num && (
                      <span className="h-2 w-2 rounded-full bg-[#e1d5c0]" />
                    )}
                  </span>
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="my-12 h-px w-full bg-zinc-800/30" />

        {/* BOTTOM ACTION SECTION */}
        <div className="relative mt-12 flex items-center justify-between">
          {/* The "Classified" Stamp Area */}
          <div className="relative h-24 w-48 border-2 border-dashed border-red-900/20 flex items-center justify-center rounded-sm">
            <span className="font-mono text-xs tracking-widest text-red-900/40 uppercase text-center">
              Official Use Only
              <br />
              Stamp Here
            </span>

            {/* Animated Stamp that appears on click */}
            {isClassified && (
              <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in spin-in-12 duration-300">
                <span className="rotate-[-10deg] rounded border-4 border-red-700 px-4 py-2 font-serif text-3xl font-black uppercase tracking-widest text-red-700 opacity-90 mix-blend-multiply">
                  CLASSIFIED
                </span>
              </div>
            )}
          </div>

          {/* Brushed Metal Button */}
          <button
            onClick={handleCreateCase}
            className="group relative overflow-hidden rounded bg-zinc-900 px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.2em] text-zinc-300 shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-all hover:text-white active:scale-95 active:shadow-none"
          >
            {/* Subtle crimson rim light simulating the button edge */}
            <div className="absolute inset-0 border border-red-900/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[inset_0_0_15px_rgba(220,38,38,0.2)]" />

            {/* Brushed metal grain overlay */}
            <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIG9wYWNpdHk9IjAuMSIvPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIiBvcGFjaXR5PSIwLjEiLz4KPC9zdmc+')]"></div>

            <span className="relative z-10">Create Case</span>
          </button>
        </div>
      </div>
    </div>
  );
}
