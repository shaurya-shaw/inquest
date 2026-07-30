"use client";
import InvestigationLobby from "@/components/lobby/Lobby";
import { socket } from "@/lib/socket";
import { usePlayerStore } from "@/stores/player-store";
import { type RoomState, useRoomStore } from "@/stores/room-store";
import { useCaseStore } from "@/stores/case-store";
import type { PublicCaseData } from "@/lib/case-types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import InvestigationPage from "@/components/investigation/InvestigationPage";

export default function InvestigationRoom() {
  const {
    phase,
    caseId,
    players,
    maxInvestigators,
    updateRoom,
    roomId,
    resetRoom,
  } = useRoomStore();
  const { playerId, isHost, resetPlayer, updatePlayer, hasHydrated } =
    usePlayerStore();
  const { setCaseData, resetCase } = useCaseStore();
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const routeRoomId = useMemo(() => {
    const value = params?.roomId;
    return typeof value === "string" ? value : "";
  }, [params]);
  const [isRejoining, setIsRejoining] = useState(true);

  useEffect(() => {
    const handleRoomUpdated = (room: RoomState) => {
      updateRoom(room);
      updatePlayer({
        roomId: room.roomId,
        isHost: room.hostId === playerId,
      });
      setIsRejoining(false);
      console.log("Room updated:", room);
    };

    const handleCaseData = (data: PublicCaseData) => {
      setCaseData(data);
      console.log("Case data received:", data.story.title);
    };

    const handleRoomClosed = ({ message }: { message: string }) => {
      toast.error(message);
      setIsRejoining(false);
      resetRoom();
      resetPlayer();
      resetCase();

      setTimeout(() => {
        router.push("/");
      }, 1500);
    };

    const handleError = ({ message }: { message: string }) => {
      toast.error(message);
      setIsRejoining(false);
      resetRoom();
      resetPlayer();
      resetCase();

      setTimeout(() => {
        router.push("/");
      }, 1200);
    };

    const handleConnect = () => {
      if (!hasHydrated || !routeRoomId || !playerId) {
        return;
      }

      socket.emit("rejoin-room", {
        roomId: routeRoomId,
        playerId,
      });
    };

    socket.on("room-updated", handleRoomUpdated);
    socket.on("case-data", handleCaseData);
    socket.on("room-closed", handleRoomClosed);
    socket.on("error", handleError);
    socket.on("connect", handleConnect);

    handleConnect();

    return () => {
      socket.off("room-updated", handleRoomUpdated);
      socket.off("case-data", handleCaseData);
      socket.off("room-closed", handleRoomClosed);
      socket.off("error", handleError);
      socket.off("connect", handleConnect);
    };
  }, [
    hasHydrated,
    playerId,
    resetCase,
    resetPlayer,
    resetRoom,
    routeRoomId,
    router,
    setCaseData,
    updatePlayer,
    updateRoom,
  ]);

  if (isRejoining && !caseId && players.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-sm uppercase tracking-[0.25em] text-neutral-400">
        Re-establishing secure uplink...
      </div>
    );
  }

  switch (phase) {
    case "LOBBY":
      return (
        <InvestigationLobby
          caseTitle={caseId ?? "Unknown Case"}
          players={players}
          maxPlayers={maxInvestigators}
          isHost={isHost}
          caseId={roomId}
        />
      );

    case "INVESTIGATION":
      return <InvestigationPage />;

    case "DISCUSSION":
    case "VOTING":
    case "RESULTS":
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#070707] font-mono">
          <div className="h-px w-16 bg-red-800/60" />
          <p className="text-[9px] uppercase tracking-[0.5em] text-red-700/80">
            {phase}
          </p>
          <h2 className="text-center font-serif text-2xl font-bold text-[#f0ebe3]">
            Interrogation incoming&hellip;
          </h2>
          <p className="text-xs tracking-[0.2em] text-zinc-600 uppercase">
            This feature is under construction
          </p>
          <div className="h-px w-16 bg-red-800/60" />
        </div>
      );

    default:
      return null;
  }
}
