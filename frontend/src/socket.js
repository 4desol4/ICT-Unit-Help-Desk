import { io } from "socket.io-client";
import { getToken } from "./api";

const socketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://ict-unit-help-desk.onrender.com");

const socket = io(socketUrl, {
  autoConnect: false,

  transports: ["websocket", "polling"],

  withCredentials: true,

  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,

  timeout: 20000,

  auth: {
    token: getToken(),
  },
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connect error:", err.message);
});

export const connectSocket = () => {
  socket.auth = {
    token: getToken(),
  };

  if (!socket.connected) {
    socket.connect();
  }
};

export default socket;