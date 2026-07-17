"use client";
import InvestigationLobby from "@/components/investigation/Lobby";

export default function InvestigationLobbyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e8e8e8] font-mono flex items-center justify-center p-6">
      <InvestigationLobby
        caseId="A-284"
        caseTitle="THE BLACKWOOD MANOR MURDER"
        players={[
          { id: "1", name: "Shaurya", isHost: true },
          { id: "2", name: "Rahul" },
        ]}
        maxPlayers={4}
        isHost={true}
        onStart={() => console.log("Starting investigation...")}
      />
    </div>
  );
}
