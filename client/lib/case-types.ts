/**
 * Client-side type definitions for case data received from the server.
 *
 * These are the PUBLIC-ONLY types — secret fields (truth, suspect role, secrets,
 * unknownFacts, memories, interrogationConstraints) are never included here.
 */

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

/** Suspect data visible during the investigation phase — no secrets, no role */
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
  /** Only "public" events are ever sent to clients */
  visibility: "public";
}

/** Full payload received from the server's `case-data` Socket.IO event */
export interface PublicCaseData {
  story: CaseStory;
  victim: CaseVictim;
  suspects: PublicSuspect[];
  evidence: CaseEvidence[];
  timeline: CaseTimelineEvent[];
}
