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

app.use(cors());
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
  const os = require('os')
  const interfaces = os.networkInterfaces()
  let localIP = 'localhost'
  
  // Find local IP
  for (const [key, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        localIP = addr.address
        break
      }
    }
  }

  console.log(`\n✅ Server running on http://localhost:${PORT}`)
  console.log(`📡 Local WiFi: http://${localIP}:${PORT}`)
  console.log(`🔗 Give staff: http://${localIP}:5173\n`)
})
