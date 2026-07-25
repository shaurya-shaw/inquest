import express from "express";
import { createServer } from "http";
import { Server, type Socket } from "socket.io";
import { config } from "dotenv";
import { generateRoomCode } from "./utils.js";
import { rooms, playerRoomMap } from "./rooms.js";
import type { PublicRoom, Room } from "./types.js";
import {
  MAX_INVESTIGATION_TIME,
  MIN_INVESTIGATION_TIME,
} from "./investigation-config.js";

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
    readyPlayers: room.readyPlayers,
    phaseStartedAt: room.phaseStartedAt,
    phaseDuration: room.phaseDuration,
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

    io.to(roomId).emit("room-updated", serializeRoom(room));
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

      console.log(`Room ${roomId}: max investigation timer expired — transitioning to DISCUSSION`);
      currentRoom.phase = "DISCUSSION";
      currentRoom.readyPlayers = [];
      investigationTimers.delete(roomId);
      io.to(roomId).emit("room-updated", serializeRoom(currentRoom));
    }, MAX_INVESTIGATION_TIME * 1000);

    investigationTimers.set(roomId, maxTimer);

    io.to(roomId).emit("room-updated", serializeRoom(room));
    console.log(`Investigation started in room ${roomId}`);
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

    if (room.phase !== "INVESTIGATION") {
      socket.emit("error", { message: "Investigation is not active." });
      return;
    }

    // Enforce minimum investigation time
    const elapsed = room.phaseStartedAt
      ? (Date.now() - room.phaseStartedAt) / 1000
      : 0;

    if (elapsed < MIN_INVESTIGATION_TIME) {
      socket.emit("error", {
        message: `Investigation minimum time has not elapsed yet. Please wait ${Math.ceil(MIN_INVESTIGATION_TIME - elapsed)} more second(s).`,
      });
      return;
    }

    // Idempotent — prevent duplicate entries
    if (!room.readyPlayers.includes(playerId)) {
      room.readyPlayers.push(playerId);
      console.log(`Room ${roomId}: player ${playerId} is ready (${room.readyPlayers.length}/${room.players.length})`);
    }

    // Check if every connected player is ready
    const connectedPlayers = room.players.filter((p) => p.connected);
    const allReady = connectedPlayers.every((p) =>
      room.readyPlayers.includes(p.playerId)
    );

    if (allReady && connectedPlayers.length > 0) {
      console.log(`Room ${roomId}: all detectives ready — transitioning to DISCUSSION`);

      // Clear the max-timer since we're transitioning early
      const timer = investigationTimers.get(roomId);
      if (timer) {
        clearTimeout(timer);
        investigationTimers.delete(roomId);
      }

      room.phase = "DISCUSSION";
      room.readyPlayers = [];
      io.to(roomId).emit("room-updated", serializeRoom(room));
      return;
    }

    // Not everyone ready yet — broadcast updated ready list
    io.to(roomId).emit("room-updated", serializeRoom(room));
  });
});

httpServer.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
