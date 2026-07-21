"use client";
import InvestigationLobby from "@/components/lobby/Lobby";
import { socket } from "@/lib/socket";
import { usePlayerStore } from "@/stores/player-store";
import { type RoomState, useRoomStore } from "@/stores/room-store";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

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
  const { playerId, isHost, resetPlayer, hasHydrated } = usePlayerStore();
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
      setIsRejoining(false);
      console.log("Room updated:", room);
    };

    const handleRoomClosed = ({ message }: { message: string }) => {
      toast.error(message);
      setIsRejoining(false);
      resetRoom();
      resetPlayer();

      setTimeout(() => {
        router.push("/");
      }, 1500);
    };

    const handleError = ({ message }: { message: string }) => {
      toast.error(message);
      setIsRejoining(false);
      resetRoom();
      resetPlayer();

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
    socket.on("room-closed", handleRoomClosed);
    socket.on("error", handleError);
    socket.on("connect", handleConnect);

    handleConnect();

    return () => {
      socket.off("room-updated", handleRoomUpdated);
      socket.off("room-closed", handleRoomClosed);
      socket.off("error", handleError);
      socket.off("connect", handleConnect);
    };
  }, [
    hasHydrated,
    playerId,
    resetPlayer,
    resetRoom,
    routeRoomId,
    router,
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

    // case "INVESTIGATION":
    //   return <Investigation />;

    // case "DISCUSSION":
    //   return <Discussion />;

    // case "VOTING":
    //   return <Voting />;

    // case "RESULTS":
    //   return <Results />;
  }
}
