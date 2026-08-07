/**
 * Normalizes the player's raw message before intent classification.
 *
 * Replaces:
 * - "him" / "her" / "they" / "the victim" → victim's actual name
 * - Suspect name shortcuts → full names
 * Trims and collapses whitespace.
 */
export function resolveQuestion(
  rawMessage: string,
  victimName: string,
  suspectNames: Array<{ id: string; name: string }>,
): string {
  let resolved = rawMessage.trim();

  // Replace "the victim" (case-insensitive) with the actual name
  resolved = resolved.replace(/\bthe victim\b/gi, victimName);

  // Replace bare pronouns that likely refer to the victim in context
  // (only standalone words, not inside longer words)
  resolved = resolved.replace(/\bhim\b/gi, victimName);
  resolved = resolved.replace(/\bher\b/gi, victimName);

  // Replace first-name references to suspects with full names
  for (const suspect of suspectNames) {
    const firstName = suspect.name.split(" ")[0];
    if (firstName && firstName.length > 2) {
      const regex = new RegExp(`\\b${firstName}\\b`, "gi");
      resolved = resolved.replace(regex, suspect.name);
    }
  }

  // Collapse multiple spaces
  resolved = resolved.replace(/\s+/g, " ").trim();

  return resolved;
}
