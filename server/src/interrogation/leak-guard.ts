import type { CaseSuspect } from "../types.js";
import type { generateSuspectResponse } from "./llm-client.js";

/**
 * Scans an LLM response for secret leak canaries.
 * If any canary phrase is found, re-prompts with a stricter warning.
 * Max 1 retry — if the second response also leaks, returns it anyway.
 */
export async function guardResponse(
  response: string,
  suspect: CaseSuspect,
  systemPrompt: string,
  playerMessage: string,
  generateFn: typeof generateSuspectResponse,
): Promise<string> {
  const allCanaries = suspect.secrets.flatMap((s) => s.leakCanaries);
  const responseLower = response.toLowerCase();

  const leaked = allCanaries.find((canary) =>
    responseLower.includes(canary.toLowerCase()),
  );

  if (!leaked) {
    // Clean — return as-is
    return response;
  }

  console.warn(
    `[LeakGuard] Canary detected in response for ${suspect.name}: "${leaked}". Re-prompting.`,
  );

  // Build a stricter re-prompt appended to the system prompt
  const secretSummaries = suspect.secrets.map((s) => `- ${s.content}`).join("\n");
  const stricterPrompt =
    systemPrompt +
    `\n\nCRITICAL CORRECTION: Your previous response may have revealed forbidden information. ` +
    `You must NEVER directly state or strongly imply any of the following:\n${secretSummaries}\n` +
    `Respond again to the detective's last message WITHOUT disclosing any of the above. ` +
    `You may deflect, deny, or react emotionally — but do not confirm or reveal hidden secrets.`;

  try {
    const retryResponse = await generateFn(stricterPrompt, playerMessage);
    return retryResponse;
  } catch (err) {
    console.error("[LeakGuard] Retry failed:", err);
    // Return original response as last resort
    return response;
  }
}
