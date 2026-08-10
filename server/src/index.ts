import express from "express";
import { createServer } from "http";
import { Server, type Socket } from "socket.io";
import { config } from "dotenv";
import { generateRoomCode, computeGameResults } from "./utils.js";
import { rooms, playerRoomMap } from "./rooms.js";
import type { PublicRoom, Room, DiscussionMessage } from "./types.js";
import {
  MAX_INVESTIGATION_TIME,
  MIN_INVESTIGATION_TIME,
} from "./investigation-config.js";
import { loadCaseFile, getPublicCaseData } from "./case-loader.js";
import {
  registerInterrogationHandlers,
  startInterrogation,
  advanceDemoSuspect,
  startDiscussionTimer,
  clearDiscussionTimer,
  transitionToDiscussion,
} from "./interrogation/handler.js";
import { getSession } from "./interrogation/session-manager.js";

config();

const DISCONNECT_GRACE_MS = 10_000;
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
/** Tracks the max-timer setTimeout for each investigation room */
const investigationTimers = new Map<string, ReturnType<typeof setTimeout>>();

type SocketMembership = {
  roomId: string;
  playerId: string;
};

const socketMemberships = new Map<string, SocketMembership>();

function getDisconnectKey(roomId: string, playerId: string) {
  return `${roomId}:${playerId}`;
}

function serializeRoom(room: Room): PublicRoom {
  const votedPlayers = room.votes ? Array.from(room.votes.keys()) : undefined;
  
  return {
    roomId: room.roomId,
    hostId: room.hostId,
    players: room.players.map(({ playerId, name, isHost, connected }) => ({
      playerId,
      name,
      isHost,
      connected,
    })),
    phase: room.phase,
    caseId: room.caseId,
    maxInvestigators: room.maxInvestigators,
    demoSuspectIndex: room.demoSuspectIndex,
    readyPlayers: room.readyPlayers,
    phaseStartedAt: room.phaseStartedAt,
    phaseDuration: room.phaseDuration,
    votedPlayers,
  };
}

function clearDisconnectTimer(roomId: string, playerId: string) {
  const key = getDisconnectKey(roomId, playerId);
  const timer = disconnectTimers.get(key);

  if (timer) {
    clearTimeout(timer);
    disconnectTimers.delete(key);
  }
}

function removePlayerFromRoom(roomId: string, playerId: string) {
  const room = rooms.get(roomId);

  if (!room) {
    return;
  }

  room.players = room.players.filter((player) => player.playerId !== playerId);
}

function attachPlayerToRoom({
  socket,
  room,
  roomId,
  playerId,
  name,
  isHost,
}: {
  socket: Socket;
  room: Room;
  roomId: string;
  playerId: string;
  name?: string;
  isHost: boolean;
}) {
  const existingPlayer = room.players.find(
    (player) => player.playerId === playerId,
  );

  if (existingPlayer) {
    existingPlayer.name = name ?? existingPlayer.name;
    existingPlayer.isHost = isHost;
    existingPlayer.socketId = socket.id;
    existingPlayer.connected = true;
  } else {
    room.players.push({
      playerId,
      socketId: socket.id,
      name: name ?? "Unknown Detective",
      isHost,
      connected: true,
    });
  }

  socketMemberships.set(socket.id, { roomId, playerId });
  playerRoomMap.set(socket.id, roomId);
  socket.join(roomId);
  clearDisconnectTimer(roomId, playerId);
}

function markPlayerDisconnected(
  roomId: string,
  playerId: string,
  socketId: string,
) {
  const room = rooms.get(roomId);

  if (!room) {
    return;
  }

  const player = room.players.find((entry) => entry.playerId === playerId);

  if (!player || player.socketId !== socketId) {
    return;
  }

  player.connected = false;

  const key = getDisconnectKey(roomId, playerId);
  clearDisconnectTimer(roomId, playerId);

  disconnectTimers.set(
    key,
    setTimeout(() => {
      const currentRoom = rooms.get(roomId);

      if (!currentRoom) {
        disconnectTimers.delete(key);
        return;
      }

      const currentPlayer = currentRoom.players.find(
        (entry) => entry.playerId === playerId,
      );

      if (!currentPlayer || currentPlayer.connected) {
        disconnectTimers.delete(key);
        return;
      }

      removePlayerFromRoom(roomId, playerId);
      disconnectTimers.delete(key);

      if (currentRoom.hostId === playerId) {
        io.to(roomId).emit("room-closed", {
          message: "Host disconnected. Investigation terminated.",
        });

        rooms.delete(roomId);

        console.log(`Deleted room ${roomId} after host grace period expired`);

        return;
      }

      if (currentRoom.players.length === 0) {
        rooms.delete(roomId);

        console.log(`Deleted empty room ${roomId}`);

        return;
      }

      io.to(roomId).emit("room-updated", serializeRoom(currentRoom));

      console.log(
        `Room ${roomId} updated after disconnect grace period. Players left: ${currentRoom.players.length}`,
      );
    }, DISCONNECT_GRACE_MS),
  );
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("discussion-message", (payload) => {
    const membership = socketMemberships.get(socket.id);
    const roomId = membership?.roomId;
    const playerId = membership?.playerId;

    if (!roomId || !playerId) {
      socket.emit("error", { message: "You are not in any room." });
      return;
    }

    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("error", { message: "Room not found." });
      return;
    }

    const text =
      typeof payload?.content === "string" ? payload.content.trim() : "";

    if (!text) {
      return;
    }

    const sender = room.players.find((entry) => entry.playerId === playerId);

    if (!room.discussionMessages) {
      room.discussionMessages = [];
    }
    const discussionMsg: DiscussionMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      playerId,
      playerName: sender?.name ?? "Unknown Detective",
      content: text,
      timestamp: Date.now(),
    };
    room.discussionMessages.push(discussionMsg);

    io.to(roomId).emit("discussion-message", discussionMsg);
  });

  socket.on("create-room", ({ name, maxInvestigators, caseId, playerId }) => {
    const roomId = generateRoomCode();

    rooms.set(roomId, {
      roomId,
      hostId: playerId,
      players: [
        {
          playerId,
          socketId: socket.id,
          name,
          isHost: true,
          connected: true,
        },
      ],
      phase: "LOBBY",
      caseId: caseId || null,
      maxInvestigators,
      readyPlayers: [],
      phaseStartedAt: null,
      phaseDuration: null,
    });

    socketMemberships.set(socket.id, { roomId, playerId });
    playerRoomMap.set(socket.id, roomId);

    const room = rooms.get(roomId);

    socket.join(roomId);
    console.log(`Room created with ID: ${roomId} by user: ${name}`);

    socket.emit("room-created", serializeRoom(room!));
  });

  socket.on("join-room", ({ roomId, name, playerId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    const existingPlayer = room.players.find(
      (player) => player.playerId === playerId,
    );

    if (
      !existingPlayer &&
      room.players.length >= (room.maxInvestigators || Infinity)
    ) {
      socket.emit("error", { message: "Room is full" });
      return;
    }

    attachPlayerToRoom({
      socket,
      room,
      roomId,
      playerId,
      name,
      isHost: false,
    });

    console.log(`User joined room ${roomId}: ${name}`);

    io.to(roomId).emit("room-updated", serializeRoom(room));
  });

  socket.on("rejoin-room", ({ roomId, playerId }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    const player = room.players.find((entry) => entry.playerId === playerId);

    if (!player) {
      socket.emit("error", { message: "Player not found in room" });
      return;
    }

    attachPlayerToRoom({
      socket,
      room,
      roomId,
      playerId,
      name: player.name,
      isHost: player.isHost,
    });

    console.log(`User rejoined room ${roomId}: ${player.name}`);

    // Broadcast updated player list to all players in the room
    io.to(roomId).emit("room-updated", serializeRoom(room));

    // Re-hydrate the reconnecting player with full phase-appropriate state
    if (room.phase === "INVESTIGATION" && room.caseFile) {
      socket.emit("case-data", getPublicCaseData(room.caseFile));
    } else if (room.phase === "INTERROGATION" && room.caseFile) {
      // 1. Re-send public case data (story, suspects, evidence)
      socket.emit("case-data", getPublicCaseData(room.caseFile));

      // 2. Re-send suspect assignment for this player, if they have one
      const suspectId = room.suspectAssignments?.[playerId];
      if (suspectId) {
        const suspect = room.caseFile.suspects.find((s) => s.id === suspectId);
        if (suspect) {
          socket.emit("suspect-assignment", {
            suspectId: suspect.id,
            suspectName: suspect.name,
            avatarUrl: suspect.avatarUrl,
            evidence: room.caseFile.evidenceCatalog.map((e) => ({
              id: e.id,
              name: e.name,
              description: e.description,
            })),
          });

          // 3. Re-send live session state (metrics + conversation)
          const session = getSession(roomId, playerId);
          if (session) {
            socket.emit("interrogation-state-restore", {
              suspectId: session.suspectId,
              trust: session.trust,
              pressure: session.pressure,
              composure: session.composure,
              evidencePresented: session.evidencePresented,
              messages: session.messages,
            });
          }
        }
      }
    } else if (
      (room.phase === "DISCUSSION" || room.phase === "RESULTS") &&
      room.caseFile
    ) {
      // 1. Re-send public case data (needed for VotingArea suspect list)
      socket.emit("case-data", getPublicCaseData(room.caseFile));

      // 2. Re-send discussion chat history (DISCUSSION only)
      if (room.phase === "DISCUSSION" && room.discussionMessages) {
        socket.emit("discussion-history", room.discussionMessages);
      }

      // 3. Re-send vote status so the UI reflects who has already voted
      if (room.votes) {
        const votedPlayers = Array.from(room.votes.keys());
        socket.emit("vote-status-updated", {
          votedPlayers,
          voteCount: votedPlayers.length,
          totalPlayers: room.players.filter((p) => p.connected).length,
        });
      }

      // 4. Re-send game results if in RESULTS phase
      if (room.phase === "RESULTS") {
        const resultsPayload = computeGameResults(room);
        if (resultsPayload) {
          socket.emit("game-results", resultsPayload);
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);

    const membership = socketMemberships.get(socket.id);
    const roomId = membership?.roomId;
    const playerId = membership?.playerId;

    socketMemberships.delete(socket.id);

    if (!roomId || !playerId) return;

    const room = rooms.get(roomId);

    if (!room) {
      playerRoomMap.delete(socket.id);
      return;
    }

    playerRoomMap.delete(socket.id);

    // If the player had voted during discussion phase, preserve their vote
    // (votes Map persists even when player is marked disconnected)
    
    markPlayerDisconnected(roomId, playerId, socket.id);

    const updatedRoom = rooms.get(roomId);

    if (updatedRoom) {
      io.to(roomId).emit("room-updated", serializeRoom(updatedRoom));
      console.log(`Room ${roomId} marked disconnected for player ${playerId}`);
    }
  });

  socket.on("leave-room", () => {
    const membership = socketMemberships.get(socket.id);
    const roomId = membership?.roomId;
    const playerId = membership?.playerId;

    if (!roomId || !playerId) {
      socket.emit("error", {
        message: "You are not in any room.",
      });
      return;
    }

    const room = rooms.get(roomId);

    if (!room) {
      socketMemberships.delete(socket.id);
      playerRoomMap.delete(socket.id);
      return;
    }

    clearDisconnectTimer(roomId, playerId);
    removePlayerFromRoom(roomId, playerId);

    // Remove lookup
    socketMemberships.delete(socket.id);
    playerRoomMap.delete(socket.id);

    // Leave Socket.IO room
    socket.leave(roomId);

    // Host left -> close room
    if (room.hostId === playerId) {
      io.to(roomId).emit("room-closed", {
        message: `🚨 Investigation Terminated 
        The Lead Investigator has abandoned the case. All detectives have been dismissed.`,
      });

      rooms.delete(roomId);

      socket.emit("left-room");

      console.log(`Room ${roomId} deleted (host left)`);

      return;
    }

    // No players left
    if (room.players.length === 0) {
      rooms.delete(roomId);

      socket.emit("left-room");

      console.log(`Room ${roomId} deleted (empty)`);

      return;
    }

    // Update remaining players
    io.to(roomId).emit("room-updated", serializeRoom(room));

    // Tell this player they successfully left
    socket.emit("left-room");

    console.log(`${socket.id} left room ${roomId}`);
  });
  socket.on("start-investigation", () => {
    const membership = socketMemberships.get(socket.id);
    const roomId = membership?.roomId;
    const playerId = membership?.playerId;

    if (!roomId || !playerId) {
      socket.emit("error", {
        message: "You are not in any room.",
      });
      return;
    }

    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("error", {
        message: "Room not found.",
      });
      return;
    }

    if (room.hostId !== playerId) {
      socket.emit("error", {
        message: "Only the host can start the investigation.",
      });
      return;
    }

    // Load the selected case file and build the public payload
    if (!room.caseId) {
      socket.emit("error", {
        message: "No case selected. Please select a case before starting.",
      });
      return;
    }

    let publicCaseData;
    let loadedCaseFile;
    try {
      loadedCaseFile = loadCaseFile(room.caseId);
      publicCaseData = getPublicCaseData(loadedCaseFile);
    } catch (err) {
      console.error(`Failed to load case "${room.caseId}":`, err);
      socket.emit("error", {
        message: `Case file "${room.caseId}" could not be loaded.`,
      });
      return;
    }

    // Cache the full case file on the room for the interrogation pipeline
    room.caseFile = loadedCaseFile;

    // Initialise investigation phase state
    room.phase = "INVESTIGATION";
    room.phaseStartedAt = Date.now();
    room.phaseDuration = MAX_INVESTIGATION_TIME;
    room.readyPlayers = [];

    // Start the hard max-timer — auto-transition to DISCUSSION when it fires
    const existingTimer = investigationTimers.get(roomId);
    if (existingTimer) clearTimeout(existingTimer);

    const maxTimer = setTimeout(() => {
      const currentRoom = rooms.get(roomId);
      if (!currentRoom || currentRoom.phase !== "INVESTIGATION") return;

      console.log(
        `Room ${roomId}: max investigation timer expired — transitioning to DISCUSSION`,
      );
      currentRoom.phase = "INTERROGATION";
      currentRoom.phaseStartedAt = Date.now();
      currentRoom.phaseDuration = 5 * 60;
      currentRoom.readyPlayers = [];
      investigationTimers.delete(roomId);
      io.to(roomId).emit("room-updated", serializeRoom(currentRoom));
      // Start interrogation — assign suspects and create sessions
      if (currentRoom.caseFile) {
        startInterrogation(io, roomId, currentRoom.caseFile);
      }
    }, MAX_INVESTIGATION_TIME * 1000);

    investigationTimers.set(roomId, maxTimer);

    // Emit case-data BEFORE room-updated so the client store is populated
    // before the phase transition renders InvestigationPage
    io.to(roomId).emit("case-data", publicCaseData);
    io.to(roomId).emit("room-updated", serializeRoom(room));
    console.log(
      `Investigation started in room ${roomId} with case "${room.caseId}"`,
    );
  });

  socket.on("detective-ready", () => {
    const membership = socketMemberships.get(socket.id);
    const roomId = membership?.roomId;
    const playerId = membership?.playerId;

    if (!roomId || !playerId) {
      socket.emit("error", { message: "You are not in any room." });
      return;
    }

    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("error", { message: "Room not found." });
      return;
    }

    if (room.phase !== "INVESTIGATION" && room.phase !== "INTERROGATION") {
      socket.emit("error", { message: "Ready status is not active in this phase." });
      return;
    }

    // Enforce minimum time (MIN_INVESTIGATION_TIME for investigation, 60s for Demo Mode interrogation, 120s otherwise)
    const isDemoInterrogation =
      room.maxInvestigators === 1 && room.phase === "INTERROGATION";
    const MIN_TIME =
      room.phase === "INVESTIGATION"
        ? MIN_INVESTIGATION_TIME
        : isDemoInterrogation
          ? 60
          : 120;
    const elapsed = room.phaseStartedAt
      ? (Date.now() - room.phaseStartedAt) / 1000
      : 0;

    if (elapsed < MIN_TIME) {
      socket.emit("error", {
        message: `Minimum time has not elapsed yet. Please wait ${Math.ceil(MIN_TIME - elapsed)} more second(s).`,
      });
      return;
    }

    // Idempotent — prevent duplicate entries
    if (!room.readyPlayers.includes(playerId)) {
      room.readyPlayers.push(playerId);
      console.log(
        `Room ${roomId} (${room.phase}): player ${playerId} is ready (${room.readyPlayers.length}/${room.players.length})`,
      );
    }

    // Check if every connected player is ready
    const connectedPlayers = room.players.filter((p) => p.connected);
    const allReady = connectedPlayers.every((p) =>
      room.readyPlayers.includes(p.playerId),
    );

    if (allReady && connectedPlayers.length > 0) {
      if (room.phase === "INVESTIGATION") {
        console.log(
          `Room ${roomId}: all detectives ready in INVESTIGATION — transitioning to INTERROGATION`,
        );

        const timer = investigationTimers.get(roomId);
        if (timer) {
          clearTimeout(timer);
          investigationTimers.delete(roomId);
        }

        room.phase = "INTERROGATION";
        room.phaseStartedAt = Date.now();
        room.phaseDuration = room.maxInvestigators === 1 ? 3 * 60 : 5 * 60;
        room.readyPlayers = [];
        io.to(roomId).emit("room-updated", serializeRoom(room));
        if (room.caseFile) {
          startInterrogation(io, roomId, room.caseFile);
        }
      } else if (room.phase === "INTERROGATION") {
        if (room.maxInvestigators === 1 && (room.demoSuspectIndex ?? 0) === 0 && room.caseFile) {
          console.log(
            `Room ${roomId}: Demo Mode advancing from Suspect 1 to Suspect 2`,
          );
          advanceDemoSuspect(io, roomId, room.caseFile);
          io.to(roomId).emit("room-updated", serializeRoom(room));
        } else {
          console.log(
            `Room ${roomId}: all detectives ready in INTERROGATION — transitioning to DISCUSSION`,
          );
          transitionToDiscussion(io, roomId);
        }
      }
      return;
    }

    // Not everyone ready yet — broadcast updated ready list
    io.to(roomId).emit("room-updated", serializeRoom(room));
  });

  socket.on("submit-vote", ({ suspectId }) => {
    const membership = socketMemberships.get(socket.id);
    const roomId = membership?.roomId;
    const playerId = membership?.playerId;

    if (!roomId || !playerId) {
      socket.emit("error", { message: "You are not in any room." });
      return;
    }

    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("error", { message: "Room not found." });
      return;
    }

    if (room.phase !== "DISCUSSION") {
      socket.emit("error", { message: "Voting is only available during discussion phase." });
      return;
    }

    // Validate suspectId exists in the case file
    if (!room.caseFile) {
      socket.emit("error", { message: "Case data not available." });
      return;
    }

    const suspectExists = room.caseFile.suspects.some((s) => s.id === suspectId);
    if (!suspectExists) {
      socket.emit("error", { message: "Invalid suspect ID." });
      return;
    }

    // Check if player already voted
    if (room.votes?.has(playerId)) {
      socket.emit("error", { message: "You have already voted." });
      return;
    }

    // Record the vote
    if (!room.votes) {
      room.votes = new Map();
    }
    room.votes.set(playerId, suspectId);

    console.log(`[Discussion] Player ${playerId} voted for suspect ${suspectId} in room ${roomId}`);

    // Emit vote-status-updated to all players in the room
    const votedPlayers = Array.from(room.votes.keys());
    io.to(roomId).emit("vote-status-updated", {
      votedPlayers,
      voteCount: votedPlayers.length,
      totalPlayers: room.players.filter((p) => p.connected).length,
    });

    // Check if all connected players have voted
    const connectedPlayers = room.players.filter((p) => p.connected);
    const allVoted = connectedPlayers.every((p) => room.votes?.has(p.playerId));

    if (allVoted && connectedPlayers.length > 0) {
      console.log(`[Discussion] All players voted in room ${roomId} — transitioning to RESULTS early`);

      // Clear the discussion timer
      clearDiscussionTimer(roomId);

      // Transition to RESULTS
      room.phase = "RESULTS";
      room.readyPlayers = [];

      const resultsPayload = computeGameResults(room);
      if (resultsPayload) {
        io.to(roomId).emit("game-results", resultsPayload);
      }

      io.to(roomId).emit("room-updated", serializeRoom(room));
    }
  });

  // ── Interrogation pipeline ────────────────────────────────────────────────
  registerInterrogationHandlers(io, socket);
});

httpServer.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
