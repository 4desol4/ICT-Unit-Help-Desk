import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    __VITE_API_BASE__: JSON.stringify(
      process.env.VITE_API_BASE ||
        "https://ict-unit-help-desk.onrender.com/api",
    ),
    __VITE_SOCKET_URL__: JSON.stringify(
      process.env.VITE_SOCKET_URL || "https://ict-unit-help-desk.onrender.com",
    ),
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["support.local", ".local", "localhost"],
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
