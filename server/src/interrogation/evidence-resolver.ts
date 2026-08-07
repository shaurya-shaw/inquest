import type { CaseSuspect, UnknownFact, SuspectSecret } from "../types.js";
import type { SuspectSessionState } from "./types.js";

export interface EvidenceResolution {
  triggeredUnknownFact?: UnknownFact;
  triggeredTell?: NonNullable<SuspectSecret["tell"]>;
  alreadyPresented: boolean;
}

/**
 * Checks if presented evidence triggers any unknownFact or secret.tell
 * on the assigned suspect.
 *
 * No validity check — evidenceId always comes from the UI picker and
 * is guaranteed to exist in the evidenceCatalog.
 */
export function resolveEvidence(
  evidenceId: string,
  suspect: CaseSuspect,
  session: SuspectSessionState,
): EvidenceResolution {
  const alreadyPresented = session.evidencePresented.includes(evidenceId);

  // Check unknownFacts for a matching trigger
  const triggeredUnknownFact = suspect.unknownFacts.find(
    (uf) =>
      uf.triggerEvidenceId === evidenceId &&
      !session.unlockedReactions.includes(uf.id),
  );

  // Check secrets for a matching tell
  const triggeredTell = suspect.secrets.find(
    (s) => s.tell?.triggerEvidenceId === evidenceId,
  )?.tell;

  const result: EvidenceResolution = { alreadyPresented };
  if (triggeredUnknownFact) result.triggeredUnknownFact = triggeredUnknownFact;
  if (triggeredTell) result.triggeredTell = triggeredTell;
  return result;
}
