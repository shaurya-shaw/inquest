import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

/**
 * Model name for the main suspect LLM.
 * Left empty intentionally — configure this when you decide the model.
 */
const MODEL_NAME = "";

/**
 * Generates a suspect's in-character response to the player's message.
 *
 * @param systemPrompt - The assembled context prompt from context-assembler
 * @param playerMessage - The player's question or evidence presentation text
 * @returns The suspect's response as a string
 */
export async function generateSuspectResponse(
  systemPrompt: string,
  playerMessage: string,
): Promise<string> {
  if (!MODEL_NAME) {
    throw new Error(
      "[LLMClient] MODEL_NAME is not configured. Set the model name in server/src/interrogation/llm-client.ts",
    );
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: playerMessage,
    config: { systemInstruction: systemPrompt },
  });

  return response.text ?? "";
}
