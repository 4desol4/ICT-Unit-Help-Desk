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
 
    res.json({ success: true });
  } catch (error) {
    console.error("POST /notifications/register error:", error);
    res.status(500).json({ error: "Could not register push token." });
  }
});
 
router.delete("/unregister", async (req, res) => {
  const { token } = req.body;
 
  if (!token) {
    return res.status(400).json({ error: "Notification token is required." });
  }
 
  try {
    await prisma.notificationToken.deleteMany({ where: { token } });
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /notifications/unregister error:", error);
    res.status(500).json({ error: "Could not unregister push token." });
  }
});
 
module.exports = router;
 