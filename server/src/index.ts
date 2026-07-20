import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "dotenv";
import { generateRoomCode } from "./utils.js";
import { rooms, playerRoomMap } from "./rooms.js";

config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("create-room", ({ name, maxInvestigators, caseId }) => {
    const roomId = generateRoomCode();

    rooms.set(roomId, {
      roomId,
      hostId: socket.id,
      players: [{ id: socket.id, name, isHost: true }],
      phase: "LOBBY",
      caseId: caseId || null,
      maxInvestigators,
    });

    playerRoomMap.set(socket.id, roomId);

    const room = rooms.get(roomId);

    socket.join(roomId);
    console.log(`Room created with ID: ${roomId} by user: ${name}`);

    socket.emit("room-created", room);
  });
  socket.on("join-room", ({ roomId, name }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    if (room.players.length >= (room.maxInvestigators || Infinity)) {
      socket.emit("error", { message: "Room is full" });
      return;
    }

    room.players.push({ id: socket.id, name, isHost: false });

    playerRoomMap.set(socket.id, roomId);

    console.log(roomId);
    console.log(room.players);
    socket.join(roomId);
    console.log(`User joined room ${roomId}: ${name}`);

    io.to(roomId).emit("room-updated", room);
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);

    const roomId = playerRoomMap.get(socket.id);

    if (!roomId) return;

    const room = rooms.get(roomId);

    if (!room) {
      playerRoomMap.delete(socket.id);
      return;
    }

    room.players = room.players.filter((player) => player.id !== socket.id);

    playerRoomMap.delete(socket.id);

    // Host disconnected
    if (room.hostId === socket.id) {
      io.to(roomId).emit("room-closed", {
        message: "Host disconnected. Investigation terminated.",
      });

      rooms.delete(roomId);

      console.log(`Deleted room ${roomId}`);

      return;
    }

    // Empty room
    if (room.players.length === 0) {
      rooms.delete(roomId);

      console.log(`Deleted empty room ${roomId}`);

      return;
    }

    io.to(roomId).emit("room-updated", room);

    console.log(`Room ${roomId} updated. Players left: ${room.players.length}`);
  });
  socket.on("leave-room", () => {
    const roomId = playerRoomMap.get(socket.id);

    if (!roomId) {
      socket.emit("error", {
        message: "You are not in any room.",
      });
      return;
    }

    const room = rooms.get(roomId);

    if (!room) {
      playerRoomMap.delete(socket.id);
      return;
    }

    // Remove player
    room.players = room.players.filter((player) => player.id !== socket.id);

    // Remove lookup
    playerRoomMap.delete(socket.id);

    // Leave Socket.IO room
    socket.leave(roomId);

    // Host left -> close room
    if (room.hostId === socket.id) {
      io.to(roomId).emit("room-closed", {
        message: "Host left the investigation.",
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
    io.to(roomId).emit("room-updated", room);

    // Tell this player they successfully left
    socket.emit("left-room");

    console.log(`${socket.id} left room ${roomId}`);
  });
});

httpServer.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
