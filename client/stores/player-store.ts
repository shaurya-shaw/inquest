import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const createPlayerId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `player-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

interface PlayerState {
  playerId: string;
  detectiveName: string;
  roomId: string;
  isHost: boolean;
  hasHydrated: boolean;

  updatePlayer: (
    player: Partial<Omit<PlayerState, "updatePlayer" | "reset">>,
  ) => void;

  resetPlayer: () => void;
}

const initialState = {
  playerId: createPlayerId(),
  detectiveName: "",
  roomId: "",
  isHost: false,
  hasHydrated: false,
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      ...initialState,

      updatePlayer: (player) =>
        set((state) => ({
          ...state,
          ...player,
        })),

      resetPlayer: () =>
        set((state) => ({
          playerId: state.playerId,
          detectiveName: "",
          roomId: "",
          isHost: false,
          hasHydrated: state.hasHydrated,
        })),
    }),
    {
      name: "inquest-player-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        playerId: state.playerId,
        detectiveName: state.detectiveName,
        roomId: state.roomId,
        isHost: state.isHost,
      }),
      onRehydrateStorage: () => (state) => {
        state?.updatePlayer({ hasHydrated: true });
      },
    },
  ),
);
