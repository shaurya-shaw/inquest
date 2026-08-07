import { GoogleGenAI } from "@google/genai";
import type { SuspectSessionState } from "./types.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
const COMPRESSION_MODEL = "gemini-2.0-flash-lite";

// In-memory session store: "${roomId}:${playerId}" → SuspectSessionState
const sessions = new Map<string, SuspectSessionState>();

const COMPRESSION_INTERVAL = 6; // compress every 6 turns

function sessionKey(roomId: string, playerId: string): string {
  return `${roomId}:${playerId}`;
}

/** Creates and stores a new session for a player */
export function createSession(
  roomId: string,
  playerId: string,
  suspectId: string,
): SuspectSessionState {
  const session: SuspectSessionState = {
    suspectId,
    playerId,
    roomId,
    trust: 10,
    pressure: 10,
    composure: 80,
    evidencePresented: [],
    unlockedReactions: [],
    rationalizationUnlocked: false,
    deflectionUnlocked: false,
    emotionalCrackUnlocked: false,
    messages: [],
    compressedSummary: "",
    turnCount: 0,
  };

  sessions.set(sessionKey(roomId, playerId), session);
  return session;
}

/** Retrieves an existing session, or undefined if none exists */
export function getSession(
  roomId: string,
  playerId: string,
): SuspectSessionState | undefined {
  return sessions.get(sessionKey(roomId, playerId));
}

/** Deletes all sessions associated with a room (call on room close) */
export function deleteRoomSessions(roomId: string): void {
  const prefix = `${roomId}:`;
  for (const key of sessions.keys()) {
    if (key.startsWith(prefix)) {
      sessions.delete(key);
    }
  }
}

/**
 * Compresses conversation history every COMPRESSION_INTERVAL turns.
 * Uses flash-lite to reduce older turns to a ~100-token summary.
 * Keeps the last 3 turns verbatim in session.messages.
 */
export async function compressHistoryIfNeeded(
  session: SuspectSessionState,
): Promise<void> {
  if (session.turnCount % COMPRESSION_INTERVAL !== 0 || session.turnCount === 0) {
    return;
  }

  // Keep the last 6 messages (3 turns: player + suspect per turn)
  const recentMessages = session.messages.slice(-6);
  const olderMessages = session.messages.slice(0, -6);

  if (olderMessages.length === 0) return;

  const historyText = olderMessages
    .map((m) => `${m.role === "player" ? "Detective" : "Suspect"}: ${m.content}`)
    .join("\n");

  const compressionPrompt =
    `Summarize the following interrogation conversation in under 100 words. ` +
    `Focus on key facts revealed, emotional shifts, and evidence presented. ` +
    `Be neutral and concise:\n\n${historyText}`;

  try {
    const response = await ai.models.generateContent({
      model: COMPRESSION_MODEL,
      contents: compressionPrompt,
    });
    const summary = (response.text ?? "").trim();

    session.compressedSummary = summary;
    // Keep only the recent messages in the full history
    session.messages = recentMessages;

    console.log(`[SessionManager] Compressed history for ${session.playerId} (${olderMessages.length} messages → summary)`);
  } catch (err) {
    console.error("[SessionManager] History compression failed:", err);
    // Don't fail the request — just keep full history
  }
}
