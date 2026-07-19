import { create } from "zustand";

type RoomPhase =
  | "LOBBY"
  | "INVESTIGATION"
  | "DISCUSSION"
  | "VOTING"
  | "RESULTS"
  | "CLOSED";

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

export interface RoomState {
  roomId: string;
  hostId: string;
  players: Player[];
  phase: RoomPhase;
  caseId: string | null;
  maxInvestigators?: number;
  updateRoom: (room: Partial<Omit<RoomState, "updateRoom" | "reset">>) => void;
  reset: () => void;
}

const initialState = {
  roomId: "",
  hostId: "",
  players: [],
  phase: "LOBBY",
  caseId: null,
  maxInvestigators: undefined,
} as const satisfies Omit<RoomState, "updateRoom" | "reset">;

export const useRoomStore = create<RoomState>((set) => ({
  ...initialState,
  updateRoom: (room) => set((state) => ({ ...state, ...room })),
  reset: () => set(initialState),
}));
