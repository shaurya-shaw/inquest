import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "player" | "suspect";
  content: string;
  /** For evidence presentations, the evidence name */
  evidenceName?: string;
  timestamp: number;
}

/** Narrative labels derived from raw metric values */
export type ComposureLabel = "Composed" | "Rattled" | "Breaking";
export type TrustLabel = "Guarded" | "Cautious" | "Opening up";
export type PressureLabel = "Calm" | "Tense" | "Cornered";

export function getComposureLabel(value: number): ComposureLabel {
  if (value >= 60) return "Composed";
  if (value >= 30) return "Rattled";
  return "Breaking";
}

export function getTrustLabel(value: number): TrustLabel {
  if (value >= 60) return "Opening up";
  if (value >= 30) return "Cautious";
  return "Guarded";
}

export function getPressureLabel(value: number): PressureLabel {
  if (value >= 60) return "Cornered";
  if (value >= 30) return "Tense";
  return "Calm";
}

interface InterrogationState {
  // Suspect assignment
  suspectId: string | null;
  suspectName: string | null;
  avatarUrl: string | null;
  evidence: Array<{ id: string; name: string; description: string }>;

  // Chat
  messages: ChatMessage[];
  isWaitingForResponse: boolean;

  // Evidence presentation
  selectedEvidenceId: string | null;
  presentedEvidenceIds: string[];

  // Emotional metrics (raw values from server)
  trust: number;
  pressure: number;
  composure: number;

  // Timer
  interrogationStartedAt: number | null;
  interrogationEnded: boolean;

  // Actions
  setSuspectAssignment: (data: {
    suspectId: string;
    suspectName: string;
    avatarUrl?: string;
    evidence: Array<{ id: string; name: string; description: string }>;
  }) => void;
  addPlayerMessage: (content: string, evidenceName?: string) => void;
  addSuspectMessage: (content: string) => void;
  setWaitingForResponse: (waiting: boolean) => void;
  selectEvidence: (evidenceId: string | null) => void;
  markEvidencePresented: (evidenceId: string) => void;
  updateMetrics: (trust: number, pressure: number, composure: number) => void;
  startTimer: () => void;
  endInterrogation: () => void;
  resetInterrogation: () => void;
  /** Bulk-restore session state from the server after a browser refresh */
  restoreInterrogation: (state: {
    suspectId: string;
    trust: number;
    pressure: number;
    composure: number;
    evidencePresented: string[];
    messages: Array<{ role: "player" | "suspect"; content: string }>;
  }) => void;
}

let messageCounter = 0;

export const useInterrogationStore = create<InterrogationState>((set) => ({
  suspectId: null,
  suspectName: null,
  avatarUrl: null,
  evidence: [],
  messages: [],
  isWaitingForResponse: false,
  selectedEvidenceId: null,
  presentedEvidenceIds: [],
  trust: 10,
  pressure: 10,
  composure: 80,
  interrogationStartedAt: null,
  interrogationEnded: false,

  setSuspectAssignment: (data) =>
    set({
      suspectId: data.suspectId,
      suspectName: data.suspectName,
      avatarUrl: data.avatarUrl ?? null,
      evidence: data.evidence,
    }),

  addPlayerMessage: (content, evidenceName) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${++messageCounter}`,
          role: "player",
          content,
          evidenceName,
          timestamp: Date.now(),
        },
      ],
    })),

  addSuspectMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${++messageCounter}`,
          role: "suspect",
          content,
          timestamp: Date.now(),
        },
      ],
      isWaitingForResponse: false,
    })),

  setWaitingForResponse: (waiting) => set({ isWaitingForResponse: waiting }),

  selectEvidence: (evidenceId) => set({ selectedEvidenceId: evidenceId }),

  markEvidencePresented: (evidenceId) =>
    set((state) => ({
      presentedEvidenceIds: [...state.presentedEvidenceIds, evidenceId],
      selectedEvidenceId: null,
    })),

  updateMetrics: (trust, pressure, composure) =>
    set({ trust, pressure, composure }),

  startTimer: () => set({ interrogationStartedAt: Date.now() }),

  endInterrogation: () => set({ interrogationEnded: true }),

  restoreInterrogation: (serverState) => {
    const now = Date.now();
    set((state) => ({
      suspectId: state.suspectId || serverState.suspectId,
      trust: serverState.trust,
      pressure: serverState.pressure,
      composure: serverState.composure,
      presentedEvidenceIds: serverState.evidencePresented,
      // Reconstruct display messages from raw role/content pairs.
      // Assign synthetic timestamps spaced 1 s apart ending at now so
      // the chat renders in the correct order without real timestamps.
      messages: serverState.messages.map((m, i) => ({
        id: `restored-${i}`,
        role: m.role,
        content: m.content,
        timestamp: now - (serverState.messages.length - i) * 1000,
      })),
    }));
  },

  resetInterrogation: () => {
    messageCounter = 0;
    set({
      suspectId: null,
      suspectName: null,
      evidence: [],
      messages: [],
      isWaitingForResponse: false,
      selectedEvidenceId: null,
      presentedEvidenceIds: [],
      trust: 10,
      pressure: 10,
      composure: 80,
      interrogationStartedAt: null,
      interrogationEnded: false,
    });
  },
}));
