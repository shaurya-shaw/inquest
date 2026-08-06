/**
 * Client-side type definitions for case data received from the server.
 *
 * These are the PUBLIC-ONLY types — secret fields (murdererId, suspect role,
 * secrets, unknownFacts, memories, interrogationConstraints, emotionalVulnerability,
 * moralJustification, deflectionTarget, evidence implication/truth data) are
 * never included here.
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
}

/** Evidence visible to players — no implication or truth data */
export interface PublicEvidence {
  id: string;
  name: string;
  description: string;
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
  caseBrief: string;
  victim: CaseVictim;
  suspects: PublicSuspect[];
  evidence: PublicEvidence[];
  timeline: CaseTimelineEvent[];
}
