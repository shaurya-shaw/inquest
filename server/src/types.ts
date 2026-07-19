export interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

type RoomPhase =
  | "LOBBY"
  | "INVESTIGATION"
  | "DISCUSSION"
  | "VOTING"
  | "RESULTS"
  | "CLOSED";

export interface Room {
  roomId: string;
  hostId: string;
  players: Player[];
  phase: RoomPhase;
  caseId: string | null;
  maxInvestigators?: number;
}
