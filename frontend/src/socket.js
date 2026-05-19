import { io } from "socket.io-client";

const socketUrl =
  typeof __VITE_SOCKET_URL__ !== "undefined"
    ? __VITE_SOCKET_URL__
    : import.meta.env.VITE_SOCKET_URL || window.location.origin;
const socket = io(socketUrl);

export default socket;
