import { socket } from "@/lib/socket";
import { useRoomStore } from "@/stores/room-store";
import { usePlayerStore } from "@/stores/player-store";
import { useCaseStore } from "@/stores/case-store";
import { useInterrogationStore } from "@/stores/interrogation-store";
import { useNotebookStore } from "@/stores/notebook-store";

/**
 * Completely cleans up all client-side state, clears storage items,
 * and notifies the server when a player leaves a room or returns home.
 */
export function clearGameSessionData(): void {
  // 1. Notify server that the player has left the room
  try {
    socket.emit("leave-room");
  } catch {
    // Ignore socket error if disconnected
  }

  // 2. Reset all Zustand stores to initial states
  useRoomStore.getState().resetRoom();
  usePlayerStore.getState().resetPlayer();
  useCaseStore.getState().resetCase();
  useInterrogationStore.getState().resetInterrogation();
  useNotebookStore.getState().clearNotes();

  // 3. Purge session-scoped story progress keys
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("inquest-story-progress-")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {
      // Ignore storage quota or security errors
    }
  }
}
