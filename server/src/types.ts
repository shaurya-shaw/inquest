export interface Player {
  playerId: string;
  socketId: string;
  name: string;
  isHost: boolean;
  connected: boolean;
}

/** A single message in the DISCUSSION phase chat, cached on the Room for reconnect */
export interface DiscussionMessage {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  timestamp: number;
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
  | "INTERROGATION"
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
  /** playerId → suspectId assignments (set when INTERROGATION starts) */
  suspectAssignments?: Record<string, string>;
  /** Full case file cached after first load — used by interrogation pipeline */
  caseFile?: CaseFile;
  /** Map of playerId → suspectId votes (null if player didn't vote before timer expired) */
  votes?: Map<string, string | null>;
  /** In-memory DISCUSSION chat log — replayed to reconnecting players */
  discussionMessages?: DiscussionMessage[];
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
  /** Array of playerIds who have submitted votes */
  votedPlayers?: string[] | undefined;
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

// ── Suspect sub-types ──────────────────────────────────────────────────────

export interface UnknownFact {
  id: string;
  /** Must match an evidence catalog entry id */
  triggerEvidenceId: string;
  /** The hidden truth this fact contains */
  content: string;
  /** Behavior instruction when confronted with this evidence */
  reactionInstruction: string;
  /** Integer, -8 to -20 — applied to composure when triggered */
  composureDelta: number;
}

export interface SuspectSecret {
  id: string;
  /** Ground truth — never stated outright by the suspect */
  content: string;
  /** 3-4 exact phrases that would only appear if the model is about to leak this secret */
  leakCanaries: string[];
  /** Optional: a visible crack without confession when specific evidence lands */
  tell?: {
    triggerEvidenceId: string;
    reactionInstruction: string;
    composureDelta: number;
  };
}

export interface EmotionalVulnerability {
  /** Clause droppable directly after "Reference your emotional vulnerability: " */
  summary: string;
  /** Specific subjects/phrases a player can raise to build trust unusually fast */
  triggerTopics: string[];
}

export interface MoralJustification {
  /** Full paragraph the character would actually say once rationalizing — not a design note */
  statement: string;
}

export interface DeflectionTarget {
  suspectId: string;
  /** Droppable directly after "steering attention toward " */
  displayName: string;
  /** The specific real thing they observed and will surface */
  angle: string;
}

/** Full suspect record — lives only on the server, never sent whole to clients */
export interface CaseSuspect {
  id: string;
  name: string;
  avatarUrl?: string | undefined;
  age: number;
  occupation: string;
  relationshipToVictim: string;
  personality: string;
  speakingStyle: string;
  currentEmotionalState: string;
  publicAlibi: string;
  possibleMotive: string;
  knownFacts: string[];
  /** Never sent to clients — gated behind evidence presentation */
  unknownFacts: UnknownFact[];
  /** Never sent to clients — guarded by leak canaries */
  secrets: SuspectSecret[];
  /** Sent only during interrogation phase */
  memories: string[];
  /** Never sent to clients */
  interrogationConstraints: string[];
  /** Never sent to clients */
  role: "murderer" | "innocent";
  emotionalVulnerability: EmotionalVulnerability;
  /** Only present on murderer — used when rationalization gate opens */
  moralJustification?: MoralJustification;
  /** Only present on innocent — used when deflection gate opens */
  deflectionTarget?: DeflectionTarget;
}

// ── Evidence ───────────────────────────────────────────────────────────────

export interface EvidenceCatalogEntry {
  id: string;
  name: string;
  description: string;
  /** Which suspect this evidence superficially implicates */
  superficiallyImplicates: string;
  /** What the implicated suspect would say if confronted */
  innocentExplanation: string;
  /** Game-master only — the actual truth behind this evidence */
  trueSequenceOfEvents: string;
}

// ── Timeline ───────────────────────────────────────────────────────────────

export interface CaseTimelineEvent {
  time: string;
  who: string[];
  where: string;
  what: string;
  visibility: "public" | "hidden";
}

export interface SuspectAccountedLocation {
  hour: string;
  /** suspectId → their claimed location during this hour */
  locations: Record<string, string>;
}

// ── Full case file (server-only, never sent whole to clients) ──────────────

export interface CaseFile {
  story: CaseStory;
  /** One-paragraph noir-style summary for lobby/results */
  caseBrief: string;
  victim: CaseVictim;
  suspects: CaseSuspect[];
  evidenceCatalog: EvidenceCatalogEntry[];
  timeline: CaseTimelineEvent[];
  suspectAccountedLocations: SuspectAccountedLocation[];
  /** Checked against player votes to determine win/loss */
  murdererId: string;
}

// ── Public subsets sent to clients ───────────────────────────────────────────

/** Suspect data safe to send during the investigation phase */
export interface PublicSuspect {
  id: string;
  name: string;
  avatarUrl?: string | undefined;
  age: number;
  occupation: string;
  relationshipToVictim: string;
  personality: string;
  speakingStyle: string;
  currentEmotionalState: string;
  publicAlibi: string;
  possibleMotive: string;
  knownFacts: string[];
}

/** Evidence visible to players — no implication/truth data */
export interface PublicEvidence {
  id: string;
  name: string;
  description: string;
}

/** Full payload emitted via the `case-data` Socket.IO event when investigation starts */
export interface PublicCaseData {
  story: CaseStory;
  caseBrief: string;
  victim: CaseVictim;
  suspects: PublicSuspect[];
  evidence: PublicEvidence[];
  /** Only events with visibility: "public" */
  timeline: CaseTimelineEvent[];
}

export interface PlayerVoteResult {
  playerId: string;
  playerName: string;
  votedSuspectId: string | null;
  votedSuspectName: string;
}

/** Payload emitted via `game-results` event when RESULTS phase starts */
export interface GameResultsPayload {
  murdererId: string;
  murdererName: string;
  murdererMotive?: string | undefined;
  accusedSuspectId: string | null;
  accusedSuspectName: string;
  isCorrect: boolean;
  consensusPercentage: number;
  votes: PlayerVoteResult[];
}
