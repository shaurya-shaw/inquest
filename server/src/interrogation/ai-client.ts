import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

/**
 * Returns a lazily initialized GoogleGenAI instance.
 * Ensures process.env.GEMINI_API_KEY is read AFTER dotenv.config() runs.
 */
export function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      throw new Error(
        "[AIClient] GEMINI_API_KEY is missing or unconfigured in server/.env",
      );
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

//root cause-Node.js ES Modules evaluate top-level import statements before executing any code in index.ts, new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) was running at module load time before dotenv.config() loaded the .env file.
