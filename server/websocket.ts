import { WebSocketServer } from "ws";
import { Chat } from "./models/Chat";

export function setupWebSocket() {
  const wss = new WebSocketServer({ port: 8089 }); // <-- different port

  wss.on("connection", (socket) => {
    console.log("🔌 WebSocket: User connected");

    socket.on("message", async (data) => {
      try {
        const { sender, receiver, group, message } = JSON.parse(data.toString());

        const chat = await Chat.create({
          sender,
          receiver: receiver || null,
          group: group || null,
          message,
        });

        const outbound = JSON.stringify({ type: "chat", chat });

        wss.clients.forEach((client) => {
          if (client.readyState === 1) client.send(outbound);
        });
      } catch (err) {
        console.error("WebSocket Error:", err);
      }
    });
  });

  console.log("💬 WebSocket server running on ws://localhost:8089");
}
