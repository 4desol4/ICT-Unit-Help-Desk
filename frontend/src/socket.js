import { io } from "socket.io-client";
import { getToken } from "./api";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL || "https://ict-unit-help-desk.onrender.com";

console.log("[Socket] URL:", socketUrl);

const socket = io(socketUrl, {
  autoConnect: false,

  transports: ["websocket", "polling"],

  withCredentials: true,

  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,

  timeout: 20000,
  connect_timeout: 20000,

  auth: {
    token: getToken(),
  },
});

socket.on("connect", () => {
  console.log("[Socket] ✅ Connected:", socket.id);
  console.log(
    "[Socket] 📡 Socket authenticated and ready for real-time updates",
  );
});

socket.on("disconnect", (reason) => {
  console.warn("[Socket] ⚠️  Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("[Socket] ❌ Connection error:", err.message);
});

socket.on("error", (err) => {
  console.error("[Socket] ❌ Error:", err);
});

export const connectSocket = () => {
  const token = getToken();
  console.log("[Socket] Attempting to connect. Token present:", Boolean(token));

  if (!token) {
    console.warn("[Socket] ⚠️  No auth token — socket not connecting");
    return;
  }

  // Update auth with fresh token
  socket.auth = {
    token: token,
  };

  // Disconnect existing connection before reconnecting with new token
  if (socket.connected) {
    console.log("[Socket] Already connected, skipping connect");
    return;
  }

  console.log("[Socket] Initiating connection...");
  socket.connect();
};

export default socket;
