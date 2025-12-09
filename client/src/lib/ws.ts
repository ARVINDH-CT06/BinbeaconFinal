let socket: WebSocket | null = null;

export function connectWebSocket(userId: string) {
  if (socket) return socket; // already connected

  socket = new WebSocket("ws://localhost:8089");


  socket.onopen = () => {
    console.log("🔌 WebSocket connected");
  };

  socket.onclose = () => {
    console.log("❌ WebSocket disconnected");
    socket = null;
  };

  socket.onerror = (err) => {
    console.error("⚠️ WebSocket error", err);
  };

  return socket;
}

export function sendMessage(message: any) {
  if (!socket) return console.warn("WebSocket not connected yet");
  socket.send(JSON.stringify(message));
}

export function onMessage(callback: (data: any) => void) {
  if (!socket) return;
  socket.onmessage = (event) => {
    const parsed = JSON.parse(event.data);
    callback(parsed);
  };
}
