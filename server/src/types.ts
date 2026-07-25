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
  /** playerIds who have clicked "Ready for Discussion" */
  readyPlayers: string[];
  /** Unix timestamp (ms) when the INVESTIGATION phase started */
  phaseStartedAt: number | null;
  /** Max investigation duration in seconds */
  phaseDuration: number | null;
}

export interface PublicRoom {
  roomId: string;
  hostId: string;
  players: PublicPlayer[];
  phase: RoomPhase;
  caseId: string | null;
  maxInvestigators?: number | undefined;
  readyPlayers: string[];
  phaseStartedAt: number | null;
  phaseDuration: number | null;
}
