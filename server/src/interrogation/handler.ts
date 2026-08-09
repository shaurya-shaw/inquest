import type { Server, Socket } from "socket.io";
import type { CaseFile, CaseSuspect } from "../types.js";
import type {
  InterrogatePayload,
  InterrogationResponsePayload,
  SuspectStateUpdatePayload,
  SuspectAssignmentPayload,
} from "./types.js";
import { resolveQuestion } from "./question-resolver.js";
import { classifyIntent } from "./intent-classifier.js";
import { resolveEvidence } from "./evidence-resolver.js";
import { applyEmotionalUpdate } from "./emotional-engine.js";
import { evaluatePsychologyGate } from "./psychology-gate.js";
import { assembleContext } from "./context-assembler.js";
import { generateSuspectResponse } from "./llm-client.js";
import { guardResponse } from "./leak-guard.js";
import {
  createSession,
  getSession,
  compressHistoryIfNeeded,
  deleteRoomSessions,
} from "./session-manager.js";
import { rooms, playerRoomMap } from "../rooms.js";
import { computeGameResults } from "../utils.js";

// Per-player interrogation timers: "${roomId}:${playerId}" → NodeJS.Timeout
const interrogationTimers = new Map<string, ReturnType<typeof setTimeout>>();
// Track how many players per room are still interrogating
const activeInterrogators = new Map<string, Set<string>>();

const INTERROGATION_DURATION_SECONDS = 5 * 60; // 5 minutes

/**
 * Called by the main server to start the discussion timer after transition.
 * Automatically transitions to RESULTS when timer expires.
 */
export function startDiscussionTimer(
  io: Server,
  roomId: string,
  durationSeconds: number,
): void {
  const timer = setTimeout(() => {
    const room = rooms.get(roomId);
    if (!room || room.phase !== "DISCUSSION") return;

    console.log(`[Discussion] Timer expired for room ${roomId} — transitioning to RESULTS`);
    
    // Record null votes for players who didn't vote
    const connectedPlayers = room.players.filter((p) => p.connected);
    connectedPlayers.forEach((player) => {
      if (!room.votes?.has(player.playerId)) {
        room.votes?.set(player.playerId, null);
      }
    });

    room.phase = "RESULTS";
    room.readyPlayers = [];

    const resultsPayload = computeGameResults(room);
    if (resultsPayload) {
      io.to(roomId).emit("game-results", resultsPayload);
    }
    
    io.to(roomId).emit("room-updated", {
      roomId: room.roomId,
      hostId: room.hostId,
      players: room.players.map((p) => ({
        playerId: p.playerId,
        name: p.name,
        isHost: p.isHost,
        connected: p.connected,
      })),
      phase: room.phase,
      caseId: room.caseId,
      readyPlayers: room.readyPlayers,
      phaseStartedAt: room.phaseStartedAt,
      phaseDuration: room.phaseDuration,
      votedPlayers: room.votes ? Array.from(room.votes.keys()) : undefined,
    });
  }, durationSeconds * 1000);

  // Store timer with a special key for discussion phase
  interrogationTimers.set(`discussion:${roomId}`, timer);
}

/**
 * Assigns suspects to players randomly and starts sessions.
 * Called when the room transitions to INTERROGATION phase.
 */
export function startInterrogation(
  io: Server,
  roomId: string,
  caseFile: CaseFile,
): void {
  const room = rooms.get(roomId);
  if (!room) return;

  if (!room.phaseStartedAt || room.phase !== "INTERROGATION") {
    room.phaseStartedAt = Date.now();
  }

  if (room.maxInvestigators === 1) {
    room.demoSuspectIndex = 0;
    room.phaseDuration = 3 * 60; // 3 minutes for Suspect 1 in Demo Mode
  } else {
    room.phaseDuration = INTERROGATION_DURATION_SECONDS;
  }

  const connectedPlayers = room.players.filter((p) => p.connected);
  const suspects = caseFile.suspects;

  // Shuffle players for random assignment
  const shuffledPlayers = [...connectedPlayers].sort(() => Math.random() - 0.5);

  // Assign one suspect per player (up to the number of suspects)
  const assignments: Record<string, string> = {};
  const activeSet = new Set<string>();

  shuffledPlayers.forEach((player, index) => {
    if (index >= suspects.length) return; // more players than suspects: extras wait
    const suspect = suspects[index]!;
    assignments[player.playerId] = suspect.id;
    activeSet.add(player.playerId);
  });

  room.suspectAssignments = assignments;
  activeInterrogators.set(roomId, activeSet);

  // Emit suspect-assignment to each assigned player
  for (const [playerId, suspectId] of Object.entries(assignments)) {
    const player = room.players.find((p) => p.playerId === playerId);
    if (!player) continue;

    const suspect = suspects.find((s) => s.id === suspectId);
    if (!suspect) continue;

    // Create session
    createSession(roomId, playerId, suspectId);

    const payload: SuspectAssignmentPayload = {
      suspectId: suspect.id,
      suspectName: suspect.name,
      avatarUrl: suspect.avatarUrl,
      evidence: caseFile.evidenceCatalog.map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description,
      })),
    };

    io.to(player.socketId).emit("suspect-assignment", payload);

    // Start interrogation timer for this player
    startPlayerTimer(io, roomId, playerId);
  }
}

export function advanceDemoSuspect(
  io: Server,
  roomId: string,
  caseFile: CaseFile,
): void {
  const room = rooms.get(roomId);
  if (!room || room.maxInvestigators !== 1) return;

  const suspects = caseFile.suspects;
  if (suspects.length < 2) {
    transitionToDiscussion(io, roomId);
    return;
  }

  // Clear existing timers for this room
  for (const [key, timer] of interrogationTimers.entries()) {
    if (key.startsWith(`${roomId}:`)) {
      clearTimeout(timer);
      interrogationTimers.delete(key);
    }
  }

  room.demoSuspectIndex = 1;
  room.phaseStartedAt = Date.now();
  room.phaseDuration = 3 * 60; // 3 minutes for Suspect 2
  room.readyPlayers = [];

  const soloPlayer = room.players.find((p) => p.connected);
  if (!soloPlayer) return;

  const suspect = suspects[1]!;
  room.suspectAssignments = { [soloPlayer.playerId]: suspect.id };

  createSession(roomId, soloPlayer.playerId, suspect.id);

  const payload: SuspectAssignmentPayload = {
    suspectId: suspect.id,
    suspectName: suspect.name,
    avatarUrl: suspect.avatarUrl,
    evidence: caseFile.evidenceCatalog.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
    })),
  };

  io.to(soloPlayer.socketId).emit("suspect-assignment", payload);
  startPlayerTimer(io, roomId, soloPlayer.playerId);
}

function startPlayerTimer(
  io: Server,
  roomId: string,
  playerId: string,
): void {
  const key = `${roomId}:${playerId}`;
  const room = rooms.get(roomId);
  const elapsedMs = room?.phaseStartedAt ? Date.now() - room.phaseStartedAt : 0;
  const durationSec = room?.phaseDuration || INTERROGATION_DURATION_SECONDS;
  const remainingMs = Math.max(0, durationSec * 1000 - elapsedMs);

  const timer = setTimeout(() => {
    interrogationTimers.delete(key);
    const currentRoom = rooms.get(roomId);
    const currentPlayer = currentRoom?.players.find((p) => p.playerId === playerId);
    if (currentPlayer) {
      io.to(currentPlayer.socketId).emit("interrogation-ended", { reason: "timeout" });
    }
    console.log(`[Interrogation] Timer expired for player ${playerId} in room ${roomId}`);

    // Check if all players are done
    checkAllDone(io, roomId, playerId);
  }, remainingMs);

  interrogationTimers.set(key, timer);
}

export function transitionToDiscussion(io: Server, roomId: string): void {
  const room = rooms.get(roomId);
  if (!room || room.phase !== "INTERROGATION") return;

  // Clear running per-player interrogation timers for this room
  for (const [key, timer] of interrogationTimers.entries()) {
    if (key.startsWith(`${roomId}:`)) {
      clearTimeout(timer);
      interrogationTimers.delete(key);
    }
  }

  room.phase = "DISCUSSION";
  room.readyPlayers = [];
  room.phaseStartedAt = Date.now();
  room.phaseDuration = 180; // 3 minutes
  room.votes = new Map();

  activeInterrogators.delete(roomId);
  deleteRoomSessions(roomId);

  console.log(
    `[Interrogation] Transitioning room ${roomId} to DISCUSSION phase`,
  );

  // Start the 3-minute discussion timer
  startDiscussionTimer(io, roomId, 180);

  io.to(roomId).emit("room-updated", {
    roomId: room.roomId,
    hostId: room.hostId,
    players: room.players.map((p) => ({
      playerId: p.playerId,
      name: p.name,
      isHost: p.isHost,
      connected: p.connected,
    })),
    phase: room.phase,
    caseId: room.caseId,
    readyPlayers: room.readyPlayers,
    phaseStartedAt: room.phaseStartedAt,
    phaseDuration: room.phaseDuration,
    votedPlayers: [],
  });
}

function checkAllDone(io: Server, roomId: string, finishedPlayerId: string): void {
  const active = activeInterrogators.get(roomId);
  if (!active) return;

  active.delete(finishedPlayerId);

  if (active.size === 0) {
    transitionToDiscussion(io, roomId);
  }
}

/**
 * Registers the `interrogate` socket event handler.
 * Call this inside the socket connection handler in index.ts.
 */
export function registerInterrogationHandlers(
  io: Server,
  socket: Socket,
): void {
  socket.on("interrogate", async (payload: InterrogatePayload) => {
    // Look up roomId from playerRoomMap (socketId → roomId)
    const roomId = playerRoomMap.get(socket.id);
    if (!roomId) {
      socket.emit("error", { message: "You are not in any room." });
      return;
    }

    const room = rooms.get(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found." });
      return;
    }

    // Find playerId from the room's player list by socketId
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) {
      socket.emit("error", { message: "Player not found in room." });
      return;
    }
    const playerId = player.playerId;

    if (room.phase !== "INTERROGATION") {
      socket.emit("error", { message: "Interrogation is not active." });
      return;
    }

    // Validate this player has an assigned suspect
    const assignedSuspectId = room.suspectAssignments?.[playerId];
    if (!assignedSuspectId) {
      socket.emit("error", { message: "You have not been assigned a suspect." });
      return;
    }

    // Validate the payload targets the correct suspect
    if (payload.suspectId !== assignedSuspectId) {
      socket.emit("error", { message: "You can only interrogate your assigned suspect." });
      return;
    }

    // Get session
    const session = getSession(roomId, playerId);
    if (!session) {
      socket.emit("error", { message: "Session not found. Please rejoin." });
      return;
    }

    // Get the full case file (cached on room)
    const caseFile = room.caseFile;
    if (!caseFile) {
      socket.emit("error", { message: "Case data not available." });
      return;
    }

    const suspect = caseFile.suspects.find((s) => s.id === assignedSuspectId);
    if (!suspect) {
      socket.emit("error", { message: "Suspect not found." });
      return;
    }

    // ── Determine intent and resolve evidence ────────────────────────────

    let intent: import("./types.js").IntentType;
    let playerMessage: string;
    let evidenceResolution: import("./evidence-resolver.js").EvidenceResolution | undefined;

    if (payload.evidenceId) {
      // Player presented evidence — skip classifier
      intent = "evidence";
      playerMessage = `[Evidence presented: ${payload.evidenceId}]`;

      evidenceResolution = resolveEvidence(payload.evidenceId, suspect, session);

      // Track presented evidence
      if (!session.evidencePresented.includes(payload.evidenceId)) {
        session.evidencePresented.push(payload.evidenceId);
      }
      if (evidenceResolution.triggeredUnknownFact) {
        session.unlockedReactions.push(evidenceResolution.triggeredUnknownFact.id);
      }

      // Build the message shown to the suspect in chat context
      const evidenceEntry = caseFile.evidenceCatalog.find(
        (e) => e.id === payload.evidenceId,
      );
      playerMessage = evidenceEntry
        ? `[Shows evidence: ${evidenceEntry.name}] ${evidenceEntry.description}`
        : `[Shows evidence: ${payload.evidenceId}]`;
    } else if (payload.message) {
      // Text question — resolve and classify
      const suspectNames = caseFile.suspects.map((s) => ({
        id: s.id,
        name: s.name,
      }));
      const resolved = resolveQuestion(
        payload.message,
        caseFile.victim.name,
        suspectNames,
      );
      intent = await classifyIntent(resolved);
      playerMessage = resolved;
    } else {
      socket.emit("error", { message: "Invalid interrogate payload." });
      return;
    }

    // ── Emotional engine ─────────────────────────────────────────────────
    applyEmotionalUpdate(session, intent, playerMessage, suspect, evidenceResolution);

    // ── Psychology gate ──────────────────────────────────────────────────
    evaluatePsychologyGate(session);

    // ── History compression ──────────────────────────────────────────────
    await compressHistoryIfNeeded(session);

    // ── Context assembly ─────────────────────────────────────────────────
    const systemPrompt = assembleContext(suspect, session, evidenceResolution);

    // ── LLM call ─────────────────────────────────────────────────────────
    let rawResponse: string;
    try {
      rawResponse = await generateSuspectResponse(systemPrompt, playerMessage);
    } catch (err) {
      console.error("[Handler] LLM call failed:", err);
      socket.emit("error", { message: "The suspect could not respond. Try again." });
      return;
    }

    // ── Leak guard ───────────────────────────────────────────────────────
    const finalResponse = await guardResponse(
      rawResponse,
      suspect,
      systemPrompt,
      playerMessage,
      generateSuspectResponse,
    );

    // ── Update session history ───────────────────────────────────────────
    session.messages.push({ role: "player", content: playerMessage });
    session.messages.push({ role: "suspect", content: finalResponse });
    session.turnCount += 1;

    // ── Emit response ────────────────────────────────────────────────────
    const response: InterrogationResponsePayload = {
      message: finalResponse,
      suspectId: assignedSuspectId,
    };
    socket.emit("interrogation-response", response);

    // Emit emotional state update (no flags — only metrics)
    const stateUpdate: SuspectStateUpdatePayload = {
      suspectId: assignedSuspectId,
      trust: session.trust,
      pressure: session.pressure,
      composure: session.composure,
    };
    socket.emit("suspect-state-update", stateUpdate);
  });
}

/** Clears a player's interrogation timer (e.g. on disconnect) */
export function clearPlayerTimer(roomId: string, playerId: string): void {
  const key = `${roomId}:${playerId}`;
  const timer = interrogationTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    interrogationTimers.delete(key);
  }
}

/** Clears the discussion timer for a room */
export function clearDiscussionTimer(roomId: string): void {
  const key = `discussion:${roomId}`;
  const timer = interrogationTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    interrogationTimers.delete(key);
  }
}
