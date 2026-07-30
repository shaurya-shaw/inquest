import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import type {
  CaseFile,
  CaseSuspect,
  PublicCaseData,
  PublicSuspect,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Resolves the path to a case JSON file by its ID */
function resolveCasePath(caseId: string): string {
  return join(__dirname, "../data/cases", `${caseId}.json`);
}

/**
 * Loads and parses a case file from disk.
 * Throws if the file does not exist or is malformed JSON.
 */
export function loadCaseFile(caseId: string): CaseFile {
  const filePath = resolveCasePath(caseId);

  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    throw new Error(`Case file not found: "${caseId}" (looked at ${filePath})`);
  }

  try {
    return JSON.parse(raw) as CaseFile;
  } catch {
    throw new Error(`Case file "${caseId}" contains invalid JSON`);
  }
}

/** Strips a full CaseSuspect down to the public-safe PublicSuspect */
function toPublicSuspect(suspect: CaseSuspect): PublicSuspect {
  return {
    id: suspect.id,
    name: suspect.name,
    age: suspect.age,
    occupation: suspect.occupation,
    relationshipToVictim: suspect.relationshipToVictim,
    personality: suspect.personality,
    speakingStyle: suspect.speakingStyle,
    currentEmotionalState: suspect.currentEmotionalState,
    publicAlibi: suspect.publicAlibi,
    possibleMotive: suspect.possibleMotive,
    knownFacts: suspect.knownFacts,
    relationships: suspect.relationships,
    // unknownFacts, secrets, memories, interrogationConstraints, role — OMITTED
  };
}

/**
 * Filters a full CaseFile down to a PublicCaseData payload safe to send to clients.
 *
 * Strips:
 * - truth (murderer identity, weapon, full explanation)
 * - hidden timeline events
 * - suspect secrets, unknownFacts, memories, interrogationConstraints, role
 */
export function getPublicCaseData(caseFile: CaseFile): PublicCaseData {
  return {
    story: caseFile.story,
    victim: caseFile.victim,
    suspects: caseFile.suspects.map(toPublicSuspect),
    evidence: caseFile.evidence,
    timeline: caseFile.timeline.filter((e) => e.visibility === "public"),
  };
}
