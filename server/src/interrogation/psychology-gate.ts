import type { SuspectSessionState } from "./types.js";

/**
 * Thresholds from the architecture diagram.
 * All flags are write-once — once unlocked, never reset.
 */
const THRESHOLDS = {
  // Murderer-only: suspect starts justifying when trust is high AND composure is low
  rationalization: { minTrust: 70, maxComposure: 40 },
  // Innocent-only: suspect deflects when cornered (high pressure, low trust)
  deflection: { minPressure: 60, maxTrust: 30 },
  // Both suspects: emotional breakdown (trust + pressure both high)
  emotionalCrack: { minTrust: 50, minPressure: 50 },
} as const;

/**
 * Checks current emotional metrics against thresholds and sets
 * psychology flags on the session. Flags are write-once.
 */
export function evaluatePsychologyGate(session: SuspectSessionState): void {
  // Rationalization — murderer gate (role is not checked here;
  // context-assembler only injects moralJustification if the field exists)
  if (
    !session.rationalizationUnlocked &&
    session.trust >= THRESHOLDS.rationalization.minTrust &&
    session.composure <= THRESHOLDS.rationalization.maxComposure
  ) {
    session.rationalizationUnlocked = true;
    console.log(`[PsychGate] Rationalization unlocked for ${session.playerId}`);
  }

  // Deflection — innocent gate (same caveat: context-assembler handles role)
  if (
    !session.deflectionUnlocked &&
    session.pressure >= THRESHOLDS.deflection.minPressure &&
    session.trust <= THRESHOLDS.deflection.maxTrust
  ) {
    session.deflectionUnlocked = true;
    console.log(`[PsychGate] Deflection unlocked for ${session.playerId}`);
  }

  // Emotional crack — both suspects
  if (
    !session.emotionalCrackUnlocked &&
    session.trust >= THRESHOLDS.emotionalCrack.minTrust &&
    session.pressure >= THRESHOLDS.emotionalCrack.minPressure
  ) {
    session.emotionalCrackUnlocked = true;
    console.log(`[PsychGate] Emotional crack unlocked for ${session.playerId}`);
  }
}
