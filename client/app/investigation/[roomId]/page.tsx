"use client";
import InvestigationLobby from "@/components/lobby/Lobby";
import { usePlayerStore } from "@/stores/player-store";
import { useRoomStore } from "@/stores/room-store";

export default function InvestigationRoom() {
  const { phase, caseId, players, maxInvestigators } = useRoomStore();
  const { isHost } = usePlayerStore();

  switch (phase) {
    case "LOBBY":
      return (
        <InvestigationLobby
          caseTitle={caseId ?? "Unknown Case"}
          players={players}
          maxPlayers={maxInvestigators}
          isHost={isHost}
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
