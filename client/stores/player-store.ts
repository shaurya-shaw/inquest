import { create } from "zustand";

interface PlayerState {
  socketId: string;
  detectiveName: string;
  roomId: string;
  isHost: boolean;

  updatePlayer: (
    player: Partial<Omit<PlayerState, "updatePlayer" | "reset">>,
  ) => void;

  resetPlayer: () => void;
}

const initialState = {
  socketId: "",
  detectiveName: "",
  roomId: "",
  isHost: false,
};

export const usePlayerStore = create<PlayerState>((set) => ({
  ...initialState,

  updatePlayer: (player) =>
    set((state) => ({
      ...state,
      ...player,
    })),

  resetPlayer: () => set(initialState),
}));
