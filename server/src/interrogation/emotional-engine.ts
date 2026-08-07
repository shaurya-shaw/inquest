import type { CaseSuspect } from "../types.js";
import type { IntentType, SuspectSessionState } from "./types.js";
import type { EvidenceResolution } from "./evidence-resolver.js";

// Base metric deltas per intent type
const INTENT_DELTAS: Record<
  IntentType,
  { trust: number; pressure: number; composure: number }
> = {
  empathy:  { trust: +8,  pressure:  0,  composure: +2  },
  pressure: { trust: -5,  pressure: +8,  composure: -15 },
  general:  { trust:  0,  pressure:  0,  composure:  0  },
  // evidence is handled separately below
  evidence: { trust: -2,  pressure: +10, composure: -12 },
};

// Bonus trust when empathy message hits an emotional vulnerability trigger topic
const EMPATHY_TRIGGER_BONUS = 7; // total empathy trust = 8 + 7 = 15

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Applies emotional metric updates to the session based on intent and
 * any triggered evidence reactions. Mutates session in place.
 */
export function applyEmotionalUpdate(
  session: SuspectSessionState,
  intent: IntentType,
  resolvedMessage: string,
  suspect: CaseSuspect,
  evidenceResolution?: EvidenceResolution,
): void {
  const delta = INTENT_DELTAS[intent];

  session.trust     = clamp(session.trust     + delta.trust);
  session.pressure  = clamp(session.pressure  + delta.pressure);
  session.composure = clamp(session.composure + delta.composure);

  // Empathy bonus: check if message hits a trigger topic
  if (intent === "empathy") {
    const messageLower = resolvedMessage.toLowerCase();
    const hitsTrigger = suspect.emotionalVulnerability.triggerTopics.some(
      (topic) => messageLower.includes(topic.toLowerCase()),
    );
    if (hitsTrigger) {
      session.trust = clamp(session.trust + EMPATHY_TRIGGER_BONUS);
    }
  }

  // Evidence-specific composure hits from unknownFact trigger
  if (evidenceResolution?.triggeredUnknownFact) {
    session.composure = clamp(
      session.composure + evidenceResolution.triggeredUnknownFact.composureDelta,
    );
  }

  // Additional composure hit from a secret's tell
  if (evidenceResolution?.triggeredTell) {
    session.composure = clamp(
      session.composure + evidenceResolution.triggeredTell.composureDelta,
    );
  }
}
