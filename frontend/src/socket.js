import { io } from "socket.io-client";

// Production: use full backend URL; Dev: use window origin (localhost)
const socketUrl =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? window.location.origin // Use localhost origin in dev
    : "https://ict-unit-help-desk.onrender.com"; // Use full backend URL in production

const socket = io(socketUrl);

export default socket;
