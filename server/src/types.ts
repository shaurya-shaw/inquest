export interface Player {
  playerId: string;
  socketId: string;
  name: string;
  isHost: boolean;
  connected: boolean;
}

export interface PublicPlayer {
  playerId: string;
  name: string;
  isHost: boolean;
  connected: boolean;
}

type RoomPhase =
  | "LOBBY"
  | "INVESTIGATION"
  | "DISCUSSION"
  | "VOTING"
  | "RESULTS"
  | "CLOSED";

export interface Room {
  roomId: string;
  hostId: string;
  players: Player[];
  phase: RoomPhase;
  caseId: string | null;
  maxInvestigators?: number;
  /** playerIds who have clicked "Ready for Discussion" */
  readyPlayers: string[];
  /** Unix timestamp (ms) when the INVESTIGATION phase started */
  phaseStartedAt: number | null;
  /** Max investigation duration in seconds */
  phaseDuration: number | null;
}

export interface PublicRoom {
  roomId: string;
  hostId: string;
  players: PublicPlayer[];
  phase: RoomPhase;
  caseId: string | null;
  maxInvestigators?: number | undefined;
  readyPlayers: string[];
  phaseStartedAt: number | null;
  phaseDuration: number | null;
}

// ── Case file schema (what lives in server/data/cases/*.json) ──────────────

export interface CaseStory {
  title: string;
  caseId: string;
  paragraphs: string[];
}

export interface CaseVictim {
  id: string;
  name: string;
  age: number;
  occupation: string;
  background: string;
}

/** Full suspect record — lives only on the server, never sent whole to clients */
export interface CaseSuspect {
  id: string;
  name: string;
  age: number;
  occupation: string;
  relationshipToVictim: string;
  personality: string;
  speakingStyle: string;
  currentEmotionalState: string;
  publicAlibi: string;
  possibleMotive: string;
  knownFacts: string[];
  /** Never sent to clients */
  unknownFacts: string[];
  /** Never sent to clients */
  secrets: string[];
  /** Sent only during interrogation phase */
  memories: string[];
  relationships: string[];
  /** Never sent to clients */
  interrogationConstraints: string[];
  /** Never sent to clients */
  role: "murderer" | "innocent";
}

export interface CaseEvidence {
  id: string;
  title: string;
  description: string;
  /** Index of the story paragraph after which this evidence becomes relevant */
  unlockParagraph: number;
  importance: "low" | "medium" | "high" | "critical";
}

export interface CaseTimelineEvent {
  time: string;
  who: string[];
  where: string;
  what: string;
  visibility: "public" | "hidden";
}

export interface CaseTruth {
  murdererId: string;
  motive: string;
  weapon: string;
  causeOfDeath: string;
  coverUp: string;
  explanation: string;
  clueBreakdown: string[];
}

/** The full case file structure — server-only, never sent whole to clients */
export interface CaseFile {
  story: CaseStory;
  victim: CaseVictim;
  suspects: CaseSuspect[];
  evidence: CaseEvidence[];
  timeline: CaseTimelineEvent[];
  truth: CaseTruth;
  difficulty: "easy" | "medium" | "hard";
}

// ── Public subsets sent to clients ───────────────────────────────────────────

/** Suspect data safe to send during the investigation phase */
export interface PublicSuspect {
  id: string;
  name: string;
  age: number;
  occupation: string;
  relationshipToVictim: string;
  personality: string;
  speakingStyle: string;
  currentEmotionalState: string;
  publicAlibi: string;
  possibleMotive: string;
  knownFacts: string[];
  relationships: string[];
}

/** Full payload emitted via the `case-data` Socket.IO event when investigation starts */
export interface PublicCaseData {
  story: CaseStory;
  victim: CaseVictim;
  suspects: PublicSuspect[];
  evidence: CaseEvidence[];
  /** Only events with visibility: "public" */
  timeline: CaseTimelineEvent[];
}
