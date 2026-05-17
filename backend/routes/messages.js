const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { agentAuth, userAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// ─── GET all messages for a ticket ────────
// Used by both user and agent to load chat history
router.get("/:ticketId", async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { ticketId: Number(req.params.ticketId) },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch messages" });
  }
});

// ─── POST send a message as user ──────────
// Requires user token to know which user is sending
// Emits notification to agent
router.post("/:ticketId/user", userAuth, async (req, res) => {
  const { text } = req.body;
  const ticketId = Number(req.params.ticketId);

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        sender: "user",
        senderName: req.user.name || ticket.name,
        ticketId,
      },
    });

    req.io.emit(`chat_${ticketId}`, message);
    req.io.emit("new_message", { ticketId, message });

    if (ticket.agentId) {
      req.io.emit("agent_notification", {
        type: "new_message",
        ticketId,
        agentId: ticket.agentId,
        message: `New message on ticket #${ticketId} from ${req.user.name || ticket.name}`,
      });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Could not send message" });
  }
});

// ─── POST send a message as agent ─────────
// Requires agent token
// Emits notification to user
router.post("/:ticketId/agent", agentAuth, async (req, res) => {
  const { text } = req.body;
  const ticketId = Number(req.params.ticketId);

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        sender: "agent",
        senderName: req.agent.name,
        ticketId,
        agentId: req.agent.id,
      },
    });

    req.io.emit(`chat_${ticketId}`, message);
    req.io.emit("new_message", { ticketId, message });

    // Notify user for their ticket via userId, client filters by logged-in user
    if (ticket.userId) {
      req.io.emit("user_notification", {
        type: "new_message",
        ticketId,
        userId: ticket.userId,
        message: `New message on ticket #${ticketId} from ${req.agent.name}`,
      });
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Could not send message" });
  }
});

module.exports = router;
