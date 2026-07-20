"use client";
import InvestigationLobby from "@/components/lobby/Lobby";
import { socket } from "@/lib/socket";
import { usePlayerStore } from "@/stores/player-store";
import { useRoomStore } from "@/stores/room-store";
import { useEffect } from "react";

export default function InvestigationRoom() {
  const { phase, caseId, players, maxInvestigators, updateRoom, roomId } =
    useRoomStore();
  const { isHost } = usePlayerStore();

  useEffect(() => {
    socket.on("room-updated", (room) => {
      updateRoom(room);
      console.log("Room updated:", room);
    });

    return () => {
      socket.off("room-updated");
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
