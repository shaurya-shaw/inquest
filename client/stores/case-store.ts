import { create } from "zustand";
import type {
  CaseStory,
  CaseVictim,
  CaseEvidence,
  CaseTimelineEvent,
  PublicSuspect,
  PublicCaseData,
} from "@/lib/case-types";

interface CaseState {
  story: CaseStory | null;
  victim: CaseVictim | null;
  suspects: PublicSuspect[];
  evidence: CaseEvidence[];
  timeline: CaseTimelineEvent[];

  /** Populate the store from the server's `case-data` event payload */
  setCaseData: (data: PublicCaseData) => void;
  /** Clear all case data — call when leaving a room or on room-closed */
  resetCase: () => void;
}

const initialState = {
  story: null,
  victim: null,
  suspects: [],
  evidence: [],
  timeline: [],
} as const satisfies Omit<CaseState, "setCaseData" | "resetCase">;

export const useCaseStore = create<CaseState>((set) => ({
  ...initialState,

  setCaseData: (data) =>
    set({
      story: data.story,
      victim: data.victim,
      suspects: data.suspects,
      evidence: data.evidence,
      timeline: data.timeline,
    }),

  resetCase: () => set(initialState),
}));
