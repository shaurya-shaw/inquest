"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function TestPage() {
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("connect", () => {
      console.log("Connected to the server", socket.id);
    });
  }, []);
  return (
    <div>
      <h1>Test Page</h1>
      <p>This is a test page for the Next.js application.</p>
    </div>
  );
}
