import type { CaseSuspect } from "../types.js";
import type { SuspectSessionState } from "./types.js";
import type { EvidenceResolution } from "./evidence-resolver.js";

/**
 * Assembles the full system prompt for the main LLM call.
 *
 * Always included:
 *   - Persona: personality, speakingStyle, currentEmotionalState
 *   - Facts: knownFacts, publicAlibi
 *   - Rules: interrogationConstraints
 *
 * Conditionally included:
 *   - Evidence reaction instructions (when evidence just triggered an unknownFact)
 *   - Secret tell instructions (when evidence triggered a tell)
 *   - Rationalization mode (when rationalizationUnlocked and moralJustification exists)
 *   - Deflection mode (when deflectionUnlocked and deflectionTarget exists)
 *   - Emotional crack mode (when emotionalCrackUnlocked)
 *
 * Conversation context:
 *   - Compressed summary of older turns
 *   - Last 3 turns verbatim
 */
export function assembleContext(
  suspect: CaseSuspect,
  session: SuspectSessionState,
  evidenceResolution?: EvidenceResolution,
): string {
  const lines: string[] = [];

  // ── Core persona ────────────────────────────────────────────────────────
  lines.push(`You are ${suspect.name}, ${suspect.age}, ${suspect.occupation}.`);
  lines.push(`Your relationship to the victim: ${suspect.relationshipToVictim}`);
  lines.push(`\nPersonality: ${suspect.personality}`);
  lines.push(`Speaking style: ${suspect.speakingStyle}`);
  lines.push(`Current emotional state: ${suspect.currentEmotionalState}`);

  // ── Known facts (freely discussable) ────────────────────────────────────
  lines.push(`\nThings you know and can discuss freely:`);
  for (const fact of suspect.knownFacts) {
    lines.push(`- ${fact}`);
  }

  // ── Public alibi ────────────────────────────────────────────────────────
  lines.push(`\nYour alibi: ${suspect.publicAlibi}`);

  // ── Personal memories (color your responses) ────────────────────────────
  if (suspect.memories.length > 0) {
    lines.push(`\nPersonal memories you can draw on:`);
    for (const memory of suspect.memories) {
      lines.push(`- ${memory}`);
    }
  }

  // ── Interrogation constraints ────────────────────────────────────────────
  lines.push(`\nBehavioral rules you must always follow:`);
  for (const constraint of suspect.interrogationConstraints) {
    lines.push(`- ${constraint}`);
  }

  // ── Evidence reaction (injected only when evidence was just presented) ────
  if (evidenceResolution?.triggeredUnknownFact && !evidenceResolution.alreadyPresented) {
    const uf = evidenceResolution.triggeredUnknownFact;
    lines.push(`\n[EVIDENCE CONFRONTATION] The detective just presented evidence that relates to: ${uf.content}`);
    lines.push(`Reaction instruction: ${uf.reactionInstruction}`);
  }

  if (evidenceResolution?.triggeredTell) {
    const tell = evidenceResolution.triggeredTell;
    lines.push(`\n[TELL TRIGGERED] This evidence touches something you cannot fully hide.`);
    lines.push(`Reaction instruction: ${tell.reactionInstruction}`);
  }

  if (evidenceResolution?.alreadyPresented) {
    lines.push(`\n[ALREADY SEEN] The detective is showing you evidence you've already been confronted with. React with less emotion this time.`);
  }

  // ── Psychology modes (mutually exclusive in priority: rationalization > deflection > crack)
  if (session.rationalizationUnlocked && suspect.moralJustification) {
    lines.push(`\n[RATIONALIZATION MODE] The detective has earned your trust and broken your composure. You are no longer just defending yourself — you are starting to explain yourself. You still do not confess but you begin justifying. Reference your emotional vulnerability: ${suspect.emotionalVulnerability.summary}`);
    lines.push(`Your internal justification (the thing you're edging toward saying): "${suspect.moralJustification.statement}"`);
    lines.push(`Do not state this outright, but let fragments surface. Speak as someone who believes they were right.`);
  } else if (session.deflectionUnlocked && suspect.deflectionTarget) {
    const dt = suspect.deflectionTarget;
    lines.push(`\n[DEFLECTION MODE] You feel cornered and distrustful. You are no longer just answering — you are steering attention toward ${dt.displayName}. Surface real things you observed about them. Be specific. You are not lying, just selectively emphasizing: ${dt.angle}`);
  } else if (session.emotionalCrackUnlocked) {
    lines.push(`\n[CRACK MODE] Your composure is slipping. Shorter sentences. Longer pauses implied through ellipses. You contradict something minor you said earlier without realizing it.`);
  }

  // ── Conversation context ─────────────────────────────────────────────────
  const lastThree = session.messages.slice(-6); // 3 turns = 6 messages (player + suspect)

  if (session.compressedSummary) {
    lines.push(`\n[EARLIER CONVERSATION SUMMARY]\n${session.compressedSummary}`);
  }

  if (lastThree.length > 0) {
    lines.push(`\n[RECENT TURNS]`);
    for (const msg of lastThree) {
      const label = msg.role === "player" ? "Detective" : suspect.name;
      lines.push(`${label}: ${msg.content}`);
    }
  }

  // ── Final instruction ────────────────────────────────────────────────────
  lines.push(`\nRespond as ${suspect.name} only. Stay in character. Do not break the fourth wall. Do not acknowledge game mechanics.`);
  lines.push(`OUTPUT FORMAT: Respond with spoken dialogue ONLY. Do NOT include any stage directions, action descriptions, narrator prose, or physical gestures (e.g. no "*pauses*", no "*glances away*", no italicized actions, no bracketed descriptions). Your entire response must be words ${suspect.name} would actually say out loud — nothing else.`);

  return lines.join("\n");
}
