import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotebookState {
  notes: string;
  setNotes: (notes: string) => void;
  clearNotes: () => void;
}

export const useNotebookStore = create<NotebookState>()(
  persist(
    (set) => ({
      notes: "",
      setNotes: (notes) => set({ notes }),
      clearNotes: () => set({ notes: "" }),
    }),
    {
      name: "inquest-notebook", // localStorage key
    }
  )
);
