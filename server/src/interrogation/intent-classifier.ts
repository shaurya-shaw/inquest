import { GoogleGenAI } from "@google/genai";
import type { IntentType } from "./types.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

// Classifier model — lightweight, fast, cheap
const CLASSIFIER_MODEL = "gemini-2.0-flash-lite";

const SYSTEM_PROMPT = `You are an intent classifier for a detective interrogation game.
Classify the player's message into exactly one of these categories:
- "empathy" — the player is being understanding, sympathetic, or building rapport with the suspect
- "pressure" — the player is being confrontational, accusatory, or applying stress
- "general" — anything else (small talk, clarification, narrative questions, greetings)

Respond with ONLY the category name in lowercase. No punctuation, no explanation.`;

const VALID_INTENTS = new Set<string>(["empathy", "pressure", "general"]);

/**
 * Classifies a resolved player message into an intent using Gemini flash-lite.
 *
 * NOTE: Only called when the player sends a text message.
 * If the player presents evidence (evidenceId is set), the handler
 * hardcodes intent as "evidence" and never calls this function.
 */
export async function classifyIntent(
  resolvedMessage: string,
): Promise<Exclude<IntentType, "evidence">> {
  try {
    const response = await ai.models.generateContent({
      model: CLASSIFIER_MODEL,
      contents: resolvedMessage,
      config: { systemInstruction: SYSTEM_PROMPT },
    });
    const text = (response.text ?? "").trim().toLowerCase();

    if (VALID_INTENTS.has(text)) {
      return text as Exclude<IntentType, "evidence">;
    }

    // Fallback if the model returns something unexpected
    console.warn(`[IntentClassifier] Unexpected response: "${text}" — falling back to "general"`);
    return "general";
  } catch (err) {
    console.error("[IntentClassifier] API call failed:", err);
    return "general";
  }
}
