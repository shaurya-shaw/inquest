import { create } from "zustand";

interface PlayerState {
  socketId: string;
  detectiveName: string;
  roomId: string;

  updatePlayer: (
    player: Partial<Omit<PlayerState, "updatePlayer" | "reset">>,
  ) => void;

  reset: () => void;
}

const initialState = {
  socketId: "",
  detectiveName: "",
  roomId: "",
};

export const usePlayerStore = create<PlayerState>((set) => ({
  ...initialState,

  updatePlayer: (player) =>
    set((state) => ({
      ...state,
      ...player,
    })),

  reset: () => set(initialState),
}));
