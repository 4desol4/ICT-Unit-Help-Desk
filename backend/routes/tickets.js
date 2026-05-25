const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const { agentAuth, userAuth } = require("../middleware/auth");
const { sendPushNotification, cleanupInvalidTokens } = require("../utils/fcm");

const prisma = new PrismaClient();

const ticketValidation = [
  body("name").trim().notEmpty().withMessage("Your name is required"),
  body("department").trim().notEmpty().withMessage("Department is required"),
  body("location")
    .trim()
    .notEmpty()
    .withMessage("Room or location is required"),
  body("problem")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Please describe the problem in at least 10 characters"),
  body("priority")
    .isIn(["high", "medium", "low"])
    .withMessage("Priority must be high, medium, or low"),
];

router.get("/", async (req, res) => {
  try {
    const { status, priority, department, userId } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (department) filters.department = department;
    if (userId) filters.userId = Number(userId);

    const tickets = await prisma.ticket.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      include: { agent: { select: { id: true, name: true } } },
    });

    res.json(tickets);
  } catch (error) {
    console.error("GET /tickets error:", error);
    res.status(500).json({ error: "Could not fetch tickets" });
  }
});

router.get("/user/my", userAuth, async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { agent: { select: { id: true, name: true } } },
    });
    res.json(tickets);
  } catch (error) {
    console.error("GET /tickets/user/my error:", error);
    res.status(500).json({ error: "Could not fetch your tickets" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const [total, open, inProgress, resolved, high, medium, low] =
      await Promise.all([
        prisma.ticket.count(),
        prisma.ticket.count({ where: { status: "open" } }),
        prisma.ticket.count({ where: { status: "in_progress" } }),
        prisma.ticket.count({ where: { status: "resolved" } }),
        prisma.ticket.count({ where: { priority: "high" } }),
        prisma.ticket.count({ where: { priority: "medium" } }),
        prisma.ticket.count({ where: { priority: "low" } }),
      ]);

    res.json({
      total,
      byStatus: { open, inProgress, resolved },
      byPriority: { high, medium, low },
    });
  } catch (error) {
    console.error("GET /tickets/stats error:", error);
    res.status(500).json({ error: "Could not fetch stats" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(req.params.id) },
      include: { agent: { select: { id: true, name: true } } },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("GET /tickets/:id error:", error);
    res.status(500).json({ error: "Could not fetch ticket" });
  }
});

router.post("/", userAuth, ticketValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, department, location, problem, priority, images } = req.body;

  try {
    const ticket = await prisma.ticket.create({
      data: {
        user: { connect: { id: req.user.id } },
        name: name?.trim(),
        department,
        location,
        problem,
        priority,
        images: Array.isArray(images) ? images : [],
      },
    });

    req.io.emit("new_ticket", ticket);
    req.io.to("agents").emit("agent_notification", {
      type: "ticket_created",
      ticketId: ticket.id,
      message: `New ticket #${ticket.id} submitted by ${req.user.name || ticket.name}`,
    });
    req.io.to("admins").emit("admin_notification", {
      type: "ticket_created",
      ticketId: ticket.id,
      message: `New ticket #${ticket.id} submitted by ${req.user.name || ticket.name}`,
    });

    try {
      const agentTokens = await prisma.notificationToken.findMany({
        where: { role: "agent" },
      });

      if (agentTokens.length > 0) {
        await cleanupInvalidTokens(
          prisma,
          agentTokens,
          await sendPushNotification(
            agentTokens.map((t) => t.token),
            {
              title: `New ticket #${ticket.id}`,
              body: `Submitted by ${req.user.name || ticket.name}.`,
              icon: "/favicon.ico",
              badge: "/favicon.ico",
              data: {
                notificationId: `ticket_created_${ticket.id}`,
                ticketId: String(ticket.id),
                clickAction: "/agent",
                type: "ticket_created",
              },
            },
          ),
        );
      }
    } catch (pushError) {
      console.warn("FCM push failed for agents (new ticket):", pushError);
    }

    try {
      const adminTokens = await prisma.notificationToken.findMany({
        where: { role: "admin" },
      });

      if (adminTokens.length > 0) {
        await cleanupInvalidTokens(
          prisma,
          adminTokens,
          await sendPushNotification(
            adminTokens.map((t) => t.token),
            {
              title: `New ticket #${ticket.id}`,
              body: `Submitted by ${req.user.name || ticket.name}.`,
              icon: "/favicon.ico",
              badge: "/favicon.ico",
              data: {
                notificationId: `admin_ticket_created_${ticket.id}`,
                ticketId: String(ticket.id),
                clickAction: "/admin",
                type: "ticket_created",
              },
            },
          ),
        );
      }
    } catch (pushError) {
      console.warn("FCM push failed for admins (new ticket):", pushError);
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error("POST /tickets error:", error);
    res.status(500).json({ error: "Could not create ticket" });
  }
});

router.patch("/:id", async (req, res) => {
  const { status, agentId, resolution } = req.body;
  const ticketId = Number(req.params.id);

  try {
    const oldTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    const updateData = {};
    if (status) updateData.status = status;
    if (agentId) updateData.agentId = agentId;
    if (resolution) updateData.resolution = resolution;
    if (status === "resolved") updateData.resolvedAt = new Date();

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: { agent: { select: { id: true, name: true } } },
    });

    const statusChanged = oldTicket.status !== ticket.status;

    if (status === "resolved") {
      req.io.emit("ticket_resolved", {
        ticketId: ticket.id,
        userId: oldTicket.userId,
        problem: ticket.problem,
        agentName: ticket.agent?.name || "Support Team",
      });

      if (oldTicket.userId) {
        const userTokens = await prisma.notificationToken.findMany({
          where: { role: "user", userId: oldTicket.userId },
        });

        await cleanupInvalidTokens(
          prisma,
          userTokens,
          await sendPushNotification(
            userTokens.map((t) => t.token),
            {
              title: `Ticket #${ticket.id} resolved`,
              body: `Your ticket has been resolved by ${ticket.agent?.name || "support"}.`,
              icon: "/favicon.ico",
              badge: "/favicon.ico",
              data: {
                notificationId: `ticket_resolved_${ticket.id}`,
                ticketId: String(ticket.id),
                clickAction: `/ticket/${ticket.id}`,
                type: "ticket_resolved",
              },
            },
          ),
        );
      }
    } else if (statusChanged && ticket.userId) {
      const friendlyStatus =
        ticket.status === "in_progress"
          ? "in progress"
          : ticket.status === "open"
            ? "open"
            : ticket.status;

      req.io.emit("user_notification", {
        type: "ticket_status",
        ticketId: ticket.id,
        userId: ticket.userId,
        message: `Your ticket #${ticket.id} is now ${friendlyStatus}.`,
      });

      const userTokens = await prisma.notificationToken.findMany({
        where: { role: "user", userId: ticket.userId },
      });

      await cleanupInvalidTokens(
        prisma,
        userTokens,
        await sendPushNotification(
          userTokens.map((t) => t.token),
          {
            title: `Ticket #${ticket.id} updated`,
            body: `Your ticket status changed to ${friendlyStatus}.`,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            data: {
              notificationId: `ticket_status_${ticket.id}`,
              ticketId: String(ticket.id),
              clickAction: `/ticket/${ticket.id}`,
              type: "ticket_status",
            },
          },
        ),
      );
    }

    req.io.emit("ticket_updated", ticket);

    res.json(ticket);
  } catch (error) {
    console.error("PATCH /tickets/:id error:", error);
    res.status(500).json({ error: "Could not update ticket" });
  }
});
router.delete("/:id", async (req, res) => {
  const ticketId = Number(req.params.id);

  try {
    await prisma.ticket.delete({ where: { id: ticketId } });
    req.io.emit("ticket_deleted", { id: ticketId });
    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("DELETE /tickets/:id error:", error);
    res.status(500).json({ error: "Could not delete ticket" });
  }
});

module.exports = router;
