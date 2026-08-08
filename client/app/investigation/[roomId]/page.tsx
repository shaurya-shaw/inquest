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
import InterrogationPage from "@/components/interrogation/InterrogationPage";
import DiscussionPage from "@/components/discussion/DiscussionPage";
import ResultPage from "@/components/result/ResultPage";

import { useInterrogationStore } from "@/stores/interrogation-store";

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
  const { setSuspectAssignment, restoreInterrogation, startTimer, resetInterrogation } =
    useInterrogationStore();
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

    const handleSuspectAssignment = (data: {
      suspectId: string;
      suspectName: string;
      avatarUrl?: string;
      evidence: Array<{ id: string; name: string; description: string }>;
    }) => {
      setSuspectAssignment(data);
      startTimer();
      console.log("Suspect assignment received:", data.suspectName);
    };

    const handleInterrogationRestore = (data: {
      suspectId: string;
      trust: number;
      pressure: number;
      composure: number;
      evidencePresented: string[];
      messages: Array<{ role: "player" | "suspect"; content: string }>;
    }) => {
      restoreInterrogation(data);
      startTimer();
      console.log("Interrogation state restored for suspect:", data.suspectId);
    };

    const handleVoteStatusUpdated = ({
      votedPlayers,
    }: {
      votedPlayers: string[];
      voteCount: number;
      totalPlayers: number;
    }) => {
      updateRoom({ votedPlayers });
      console.log("Vote status updated:", votedPlayers);
    };

    const handleRoomClosed = ({ message }: { message: string }) => {
      toast.error(message);
      setIsRejoining(false);
      resetRoom();
      resetPlayer();
      resetCase();
      resetInterrogation();

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
      resetInterrogation();

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
    socket.on("suspect-assignment", handleSuspectAssignment);
    socket.on("interrogation-state-restore", handleInterrogationRestore);
    socket.on("vote-status-updated", handleVoteStatusUpdated);
    socket.on("room-closed", handleRoomClosed);
    socket.on("error", handleError);
    socket.on("connect", handleConnect);

    handleConnect();

    return () => {
      socket.off("room-updated", handleRoomUpdated);
      socket.off("case-data", handleCaseData);
      socket.off("suspect-assignment", handleSuspectAssignment);
      socket.off("interrogation-state-restore", handleInterrogationRestore);
      socket.off("vote-status-updated", handleVoteStatusUpdated);
      socket.off("room-closed", handleRoomClosed);
      socket.off("error", handleError);
      socket.off("connect", handleConnect);
    };
  }, [
    hasHydrated,
    playerId,
    resetCase,
    resetInterrogation,
    resetPlayer,
    resetRoom,
    restoreInterrogation,
    routeRoomId,
    router,
    setCaseData,
    setSuspectAssignment,
    startTimer,
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

  // return <DiscussionPage />       //for development mode only

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

    case "INTERROGATION":
      return <InterrogationPage />;
    case "DISCUSSION":
      return <DiscussionPage />;
    case "RESULTS":
      return <ResultPage />;
    default:
      return null;
  }
}
