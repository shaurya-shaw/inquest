"use client";
import InvestigationLobby from "@/components/lobby/Lobby";
import { socket } from "@/lib/socket";
import { usePlayerStore } from "@/stores/player-store";
import { useRoomStore } from "@/stores/room-store";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const { isHost, resetPlayer } = usePlayerStore();
  const router = useRouter();

  useEffect(() => {
    socket.on("room-updated", (room) => {
      updateRoom(room);
      console.log("Room updated:", room);
    });

    //Handle room closure when the host leaves
    socket.on("room-closed", ({ message }) => {
      toast.error(message);
      resetRoom();
      resetPlayer();

      setTimeout(() => {
        router.push("/");
      }, 1500);
    });

    return () => {
      socket.off("room-updated");
      socket.off("room-closed");
    };
  }, [updateRoom]);

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
