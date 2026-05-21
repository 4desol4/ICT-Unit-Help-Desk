import { io } from "socket.io-client";
import { getToken } from "./api";

const socketUrl =
  __VITE_SOCKET_URL__ ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : window.location.origin);

const socket = io(socketUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  auth: {
    token: getToken(),
  },
});

export const connectSocket = () => {
  socket.auth = { token: getToken() };
  if (!socket.connected) {
    socket.connect();
  }
};

export default socket;
