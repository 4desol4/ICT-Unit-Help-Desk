const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

// ─── Database URL Configuration ───────────────────────────
// Development: Use DATABASE_URL (local PostgreSQL)
// Production: Use NEON_DATABASE_URL (Neon cloud database)
if (isProduction && process.env.NEON_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.NEON_DATABASE_URL;
  console.log("[Config] Using NEON_DATABASE_URL for production");
} else if (!isProduction && process.env.DATABASE_URL) {
  console.log("[Config] Using DATABASE_URL for development");
}

const ticketRoutes = require("./routes/tickets");
const authRoutes = require("./routes/auth");
const agentRoutes = require("./routes/agents");
const messageRoutes = require("./routes/messages");
const imageRoutes = require("./routes/images");
const notificationRoutes = require("./routes/notifications");
const DatabaseSync = require("./utils/dbSync");

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
  },

  allowEIO3: true,

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
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ICT Support Desk API running ✅" });
});

// ─── Database Sync (for local network mode) ─────────────
// Syncs data from primary database to local PostgreSQL
const dbSync = new DatabaseSync({
  syncInterval: 5 * 60 * 1000, // 5 minutes
  syncMode: "pull", // Pull from primary database
});

if (dbSync.enabled) {
  console.log("[Server] 🔄 Database sync is ENABLED");

  // Auto-sync on startup if auto-sync is not disabled
  if (process.env.AUTO_SYNC !== "false") {
    dbSync.startAutoSync();
  }
} else {
  console.log("[Server] 📊 Using single database (no sync)");
}

// Sync status endpoint
app.get("/api/sync/status", (req, res) => {
  res.json(dbSync.getStatus());
});

// Manual sync trigger endpoint (requires admin auth in production)
app.post("/api/sync/trigger", (req, res) => {
  if (!dbSync.enabled) {
    return res.status(400).json({
      error: "Database sync not enabled - only one database configured",
      status: dbSync.getStatus(),
    });
  }

  console.log("[Sync] Manual sync triggered via API");

  dbSync
    .syncBidirectional()
    .then((success) => {
      res.json({
        success,
        lastSync: dbSync.lastSyncTime,
        message: success
          ? "Database sync completed successfully"
          : "Database sync failed - check backend logs",
        status: dbSync.getStatus(),
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err.message,
        status: dbSync.getStatus(),
      });
    });
});

io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token || socket.handshake.query?.token || null;

  console.log(
    "[Socket Auth] Connection attempt. Token present:",
    Boolean(token),
  );

  if (!token) {
    console.warn(
      "[Socket Auth] No token provided — allowing anonymous connection",
    );
    socket.data.userInfo = null;
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "ict_support_secret_key",
    );
    socket.data.userInfo = decoded;
    console.log(
      "[Socket Auth] ✅ Token verified for:",
      `${decoded.role}:${decoded.id}`,
    );
    return next();
  } catch (error) {
    console.warn("[Socket Auth] ⚠️  Token verification failed:", error.message);
    socket.data.userInfo = null;
    return next();
  }
});

io.on("connection", (socket) => {
  const auth = socket.data.userInfo;
  console.log(
    "[Socket] 🔌 Connected: ",
    socket.id,
    auth ? `(${auth.role}:${auth.id})` : "(anonymous)",
  );

  if (auth) {
    const roleRoom = `${auth.role}s`;
    const userRoom = `${auth.role}_${auth.id}`;

    socket.join(roleRoom);
    socket.join(userRoom);

    console.log("[Socket] 📍 Joined rooms:", roleRoom, "and", userRoom);

    socket.emit("authenticated", {
      id: socket.id,
      user: { id: auth.id, role: auth.role },
      rooms: [roleRoom, userRoom],
    });
  }

  socket.on("disconnect", (reason) => {
    console.log("[Socket] 🔌 Disconnected:", socket.id, "Reason:", reason);
  });

  socket.on("debug", (msg) => {
    console.log("[Socket] Debug from client:", msg);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`📡 Dev frontend: http://localhost:5173`);
  }
});
