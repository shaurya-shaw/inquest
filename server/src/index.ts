import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "dotenv";
import { generateRoomCode } from "./utils.js";
import { rooms } from "./rooms.js";

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

  socket.on("create-room", ({ name }) => {
    const roomId = generateRoomCode();

    rooms.set(roomId, {
      roomId,
      hostId: socket.id,
      players: [{ id: socket.id, name, isHost: true }],
    });

    socket.join(roomId);
    console.log(`Room created with ID: ${roomId} by user: ${name}`);

    socket.emit("room-created", { roomId });
  });
  socket.on("join-room", ({ roomId, name }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }
    console.log(roomId);
    room.players.push({ id: socket.id, name, isHost: false });
    console.log(room.players);
    socket.join(roomId);
    console.log(`User joined room ${roomId}: ${name}`);

    io.to(roomId).emit("player-joined", room);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    for (const [roomId, room] of rooms) {
      room.players = room.players.filter((player) => player.id !== socket.id);

      // If the host left, end the room
      if (room.hostId === socket.id) {
        io.to(roomId).emit("room-closed", {
          message: "Host disconnected. Investigation terminated.",
        });

        rooms.delete(roomId);

        console.log(`Room ${roomId} deleted (host disconnected)`);

        continue;
      }

      if (room.players.length === 0) {
        console.log(`Room ${roomId} deleted (empty room)`);

        continue;
      }
      // Notify remaining players
      io.to(roomId).emit("room-updated", room);

      console.log(
        `${socket.id} removed from ${roomId}. Remaining players: ${room.players.length}`,
      );
    }
  });
});

httpServer.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
