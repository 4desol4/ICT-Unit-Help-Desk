const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";
if (!isProduction && process.env.DATABASE_URL_LOCAL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_LOCAL;
}

const ticketRoutes = require("./routes/tickets");
const authRoutes = require("./routes/auth");
const agentRoutes = require("./routes/agents");
const messageRoutes = require("./routes/messages");
const imageRoutes = require("./routes/images");

const app = express();
const server = http.createServer(app);

// Allow configurable client origins (comma-separated in env)
const clientOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: clientOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowEIO3: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 60000,
});

// Attach io to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

const allowedOrigins = clientOrigins;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));

// ─── Routes ───────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/images", imageRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ICT Support Desk API running ✅" });
});

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);
  socket.on("disconnect", () => console.log(`Disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`📡 Dev frontend: http://localhost:5173`);
  }
});
