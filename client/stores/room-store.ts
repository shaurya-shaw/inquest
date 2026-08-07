import { create } from "zustand";

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
  updateRoom: (room: Partial<Omit<RoomState, "updateRoom" | "reset">>) => void;
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
} as const satisfies Omit<RoomState, "updateRoom" | "resetRoom">;

export const useRoomStore = create<RoomState>((set) => ({
  ...initialState,
  updateRoom: (room) => set((state) => ({ ...state, ...room })),
  resetRoom: () => set(initialState),
}));
