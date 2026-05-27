const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { parseToken } = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

router.post("/register", async (req, res) => {
  const { token, platform = "web", userAgent } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Notification token is required." });
  }

  const auth = parseToken(req.headers.authorization);
  if (!auth) {
    console.warn("[Notifications] Register attempt without auth");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const record = {
    token,
    platform,
    userAgent: userAgent || "browser",
    role: auth.role,
    lastSeenAt: new Date(),
  };

  if (auth.role === "user") {
    record.userId = auth.id;
  }

  if (auth.role === "agent") {
    record.agentId = auth.id;
  }

  try {
    await prisma.notificationToken.upsert({
      where: { token },
      create: record,
      update: { ...record, updatedAt: new Date() },
    });

    console.log(
      `[Notifications] ✅ Token registered: ${auth.role} (${auth.id}) on ${platform}`,
    );
    return res.json({ success: true });
  } catch (error) {
    console.error("[Notifications] Register error:", error);
    return res.status(500).json({ error: "Could not register push token." });
  }
});

router.delete("/unregister", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Notification token is required." });
  }

  try {
    await prisma.notificationToken.deleteMany({ where: { token } });
    console.log(
      `[Notifications] 🗑️  Token unregistered: ${token.substring(0, 20)}…`,
    );
    return res.json({ success: true });
  } catch (error) {
    console.error("[Notifications] Unregister error:", error);
    return res.status(500).json({ error: "Could not unregister push token." });
  }
});

module.exports = router;
