const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const ticketRoutes = require("./routes/tickets");
const authRoutes = require("./routes/auth");
const agentRoutes = require("./routes/agents");
const messageRoutes = require("./routes/messages");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// Attach io to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = [clientUrl, "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
  })
);
app.use(express.json());

// ─── Routes ───────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ICT Support Desk API running ✅" });
});

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);
  socket.on("disconnect", () => console.log(`Disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📡 Dev frontend: http://localhost:5173`);
  }
});
