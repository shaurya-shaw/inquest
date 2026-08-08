import type { CaseSuspect, EvidenceCatalogEntry } from "../types.js";

// The classifier handles 3 intents. "evidence" is hardcoded by the handler
// when evidenceId is present — never passed to the classifier.
export type IntentType = "empathy" | "pressure" | "general" | "evidence";

export interface SuspectSessionState {
  suspectId: string;
  playerId: string;
  roomId: string;

  // Emotional metrics (clamped 0–100)
  trust: number;       // starts at 10
  pressure: number;    // starts at 10
  composure: number;   // starts at 80

  // Evidence tracking
  evidencePresented: string[];     // evidence IDs the player has presented
  unlockedReactions: string[];     // unknownFact IDs that have been triggered

  // Psychology flags — write once, never reset
  rationalizationUnlocked: boolean;
  deflectionUnlocked: boolean;
  emotionalCrackUnlocked: boolean;

  // Conversation history
  messages: Array<{ role: "player" | "suspect"; content: string }>;
  compressedSummary: string;       // updated every 6 turns by flash-lite
  turnCount: number;
}

// Socket event payloads ────────────────────────────────────────────────────

/** Player submits a question OR presents evidence (mutually exclusive) */
export interface InterrogatePayload {
  suspectId: string;
  message?: string;     // text question — present when no evidenceId
  evidenceId?: string;  // evidence presentation — present when no message
}

export interface InterrogationResponsePayload {
  message: string;
  suspectId: string;
}

/** Only numeric metrics are sent to the client — no flags */
export interface SuspectStateUpdatePayload {
  suspectId: string;
  trust: number;
  pressure: number;
  composure: number;
}

export interface SuspectAssignmentPayload {
  suspectId: string;
  suspectName: string;
  avatarUrl?: string | undefined;
  evidence: Array<{ id: string; name: string; description: string }>;
}
