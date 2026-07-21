export interface Player {
  playerId: string;
  socketId: string;
  name: string;
  isHost: boolean;
  connected: boolean;
}

export interface PublicPlayer {
  playerId: string;
  name: string;
  isHost: boolean;
  connected: boolean;
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

export interface PublicRoom {
  roomId: string;
  hostId: string;
  players: PublicPlayer[];
  phase: RoomPhase;
  caseId: string | null;
  maxInvestigators?: number | undefined;
}
