const express = require("express");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET all agents (admin only) ──────────
router.get("/", adminAuth, async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        isActive: true,
        createdAt: true,
        // count their tickets
        _count: { select: { tickets: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch agents" });
  }
});

// ─── GET agent stats by ID (with resolution count) ─
router.get("/:id/stats", async (req, res) => {
  try {
    const agentId = Number(req.params.id);
    const [total, resolvedCount, inProgress, open] = await Promise.all([
      prisma.ticket.count({ where: { agentId } }),
      prisma.ticket.count({ where: { agentId, status: "resolved" } }),
      prisma.ticket.count({ where: { agentId, status: "in_progress" } }),
      prisma.ticket.count({ where: { agentId, status: "open" } }),
    ]);

    res.json({
      total,
      resolvedCount,
      inProgress,
      open,
    });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch agent stats" });
  }
});

// ─── POST create a new agent (admin only) ──
router.post("/", adminAuth, async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res
      .status(400)
      .json({ error: "Name, username and password are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  try {
    // Check username not already taken
    const existing = await prisma.agent.findUnique({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const agent = await prisma.agent.create({
      data: { name, username, password: hashed },
      select: {
        id: true,
        name: true,
        username: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ error: "Could not create agent" });
  }
});

// ─── PATCH toggle agent active/inactive ───
router.patch("/:id", adminAuth, async (req, res) => {
  const { isActive, name, password } = req.body;

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const agent = await prisma.agent.update({
      where: { id: Number(req.params.id) },
      data: updateData,
      select: { id: true, name: true, username: true, isActive: true },
    });

    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: "Could not update agent" });
  }
});

// ─── DELETE an agent ──────────────────────
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await prisma.agent.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Agent removed" });
  } catch (error) {
    res.status(500).json({ error: "Could not delete agent" });
  }
});

module.exports = router;
