import { create } from "zustand";
import type { GameResultsPayload } from "@/lib/case-types";

type RoomPhase =
  | "LOBBY"
  | "INVESTIGATION"
  | "INTERROGATION"
  | "DISCUSSION"
  | "VOTING"
  | "RESULTS"
  | "CLOSED";

export interface Player {
  playerId: string;
  name: string;
  isHost: boolean;
  connected?: boolean;
}

export interface RoomState {
  roomId: string;
  hostId: string;
  players: Player[];
  phase: RoomPhase;
  caseId: string | null;
  maxInvestigators?: number;
  /** playerIds who clicked "Ready for Discussion" */
  readyPlayers: string[];
  /** Unix timestamp (ms) when the INVESTIGATION phase started */
  phaseStartedAt: number | null;
  /** Max investigation duration in seconds */
  phaseDuration: number | null;
  /** Array of playerIds who have submitted votes during DISCUSSION phase */
  votedPlayers?: string[];
  /** Current player's vote (suspectId), null after voting */
  playerVote?: string | null;
  /** Final game results payload received from server */
  resultsData?: GameResultsPayload | null;
  updateRoom: (room: Partial<Omit<RoomState, "updateRoom" | "reset">>) => void;
  setResultsData: (results: GameResultsPayload) => void;
  resetRoom: () => void;
}

const initialState = {
  roomId: "",
  hostId: "",
  players: [],
  phase: "LOBBY",
  caseId: null,
  maxInvestigators: undefined,
  readyPlayers: [],
  phaseStartedAt: null,
  phaseDuration: null,
  votedPlayers: undefined,
  playerVote: undefined,
  resultsData: null,
} as const satisfies Omit<RoomState, "updateRoom" | "setResultsData" | "resetRoom">;

export const useRoomStore = create<RoomState>((set) => ({
  ...initialState,
  updateRoom: (room) => set((state) => ({ ...state, ...room })),
  setResultsData: (resultsData) => set({ resultsData }),
  resetRoom: () => set(initialState),
}));
