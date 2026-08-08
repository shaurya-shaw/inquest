import type { Room, GameResultsPayload, PlayerVoteResult } from "./types.js";

const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 6) {
  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

export function computeGameResults(room: Room): GameResultsPayload | null {
  if (!room.caseFile) return null;

  const suspects = room.caseFile.suspects;
  const murderer = suspects.find((s) => s.id === room.caseFile!.murdererId);
  const murdererName = murderer ? murderer.name : "Unknown Suspect";

  const voteCounts = new Map<string, number>();
  const playerVoteResults: PlayerVoteResult[] = [];

  room.players.forEach((player) => {
    const votedSuspectId = room.votes?.get(player.playerId) ?? null;
    const votedSuspect = votedSuspectId
      ? suspects.find((s) => s.id === votedSuspectId)
      : null;
    const votedSuspectName = votedSuspect
      ? votedSuspect.name
      : votedSuspectId
      ? "Unknown Suspect"
      : "Did Not Vote";

    if (votedSuspectId) {
      voteCounts.set(votedSuspectId, (voteCounts.get(votedSuspectId) || 0) + 1);
    }

    playerVoteResults.push({
      playerId: player.playerId,
      playerName: player.name,
      votedSuspectId,
      votedSuspectName,
    });
  });

  let topSuspectId: string | null = null;
  let maxVotes = 0;
  voteCounts.forEach((count, sId) => {
    if (count > maxVotes) {
      maxVotes = count;
      topSuspectId = sId;
    }
  });

  const totalVotesCast = Array.from(voteCounts.values()).reduce((a, b) => a + b, 0);
  const consensusPercentage =
    totalVotesCast > 0 ? Math.round((maxVotes / totalVotesCast) * 100) : 0;

  const accusedSuspect = topSuspectId
    ? suspects.find((s) => s.id === topSuspectId)
    : null;
  const accusedSuspectName = accusedSuspect
    ? accusedSuspect.name
    : "No Consensus Reached";

  const isCorrect = topSuspectId === room.caseFile.murdererId;

  return {
    murdererId: room.caseFile.murdererId,
    murdererName,
    murdererMotive: murderer?.possibleMotive,
    accusedSuspectId: topSuspectId,
    accusedSuspectName,
    isCorrect,
    consensusPercentage,
    votes: playerVoteResults,
  };
}
