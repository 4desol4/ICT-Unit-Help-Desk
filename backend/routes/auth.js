const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "ict_support_secret_key";

router.post("/user/login", async (req, res) => {
  const { oracleNumber } = req.body;

  if (!oracleNumber || oracleNumber.trim().length === 0) {
    return res.status(400).json({ error: "Oracle number is required" });
  }

  try {
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { oracleNumber: oracleNumber.trim() },
    });

    if (!user) {
      // First time login - create user
      user = await prisma.user.create({
        data: { oracleNumber: oracleNumber.trim() },
      });
    }

    const token = jwt.sign(
      { id: user.id, oracleNumber: user.oracleNumber, role: "user" },
      SECRET,
      { expiresIn: "30d" },
    );

    res.json({
      token,
      id: user.id,
      oracleNumber: user.oracleNumber,
      role: "user",
    });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── Admin login ──────────────────────────
// POST /api/auth/admin/login
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: "admin" },
      SECRET,
      { expiresIn: "8h" },
    );

    res.json({ token, username: admin.username, role: "admin" });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── Agent login ──────────────────────────
// POST /api/auth/agent/login
router.post("/agent/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const agent = await prisma.agent.findUnique({ where: { username } });

    if (!agent || !agent.isActive) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, agent.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: agent.id,
        name: agent.name,
        username: agent.username,
        role: "agent",
      },
      SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      id: agent.id,
      name: agent.name,
      username: agent.username,
      role: "agent",
    });
  } catch (error) {
    console.error("Agent login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
