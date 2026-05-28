const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { sendPushNotification, cleanupInvalidTokens } = require("../utils/fcm");
const { agentAuth, userAuth, adminAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// ─── Test: Send push to current user ──────────────────────────────────────
// POST /api/test/send-notification
// Useful for debugging push flow without waiting for real messages
router.post("/send-notification", agentAuth, async (req, res) => {
  const { recipientRole, recipientId, title, body } = req.body;

  if (!recipientRole || !recipientId) {
    return res.status(400).json({
      error: "recipientRole and recipientId required. Example: { recipientRole: 'user', recipientId: 8 }",
    });
  }

  console.log(
    `[TEST] /test/send-notification called by agent ${req.agent.id}`,
  );
  console.log(
    `[TEST] Sending to ${recipientRole} ${recipientId}`,
  );

  try {
    // Find tokens for the recipient
    const tokens = await prisma.notificationToken.findMany({
      where: { role: recipientRole, [recipientRole === 'user' ? 'userId' : 'agentId']: Number(recipientId) },
      select: { token: true },
    });

    console.log(
      `[TEST] Found ${tokens.length} token(s) for ${recipientRole} ${recipientId}`,
    );

    if (tokens.length === 0) {
      return res.status(404).json({
        error: `No tokens found for ${recipientRole} ${recipientId}. User may not have registered push.`,
        tokens: [],
      });
    }

    const results = await sendPushNotification(
      tokens.map((t) => t.token),
      {
        title: title || `Test notification to ${recipientRole} ${recipientId}`,
        body: body || "This is a test notification from the backend.",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        data: {
          notificationId: `test_${Date.now()}`,
          clickAction: `/${recipientRole === 'user' ? 'my-tickets' : 'agent'}`,
          type: "test",
        },
      },
    );

    console.log(
      `[TEST] Push results:`,
      results,
    );

    await cleanupInvalidTokens(prisma, tokens, results);

    res.json({
      success: true,
      tokensFound: tokens.length,
      deliveryResults: results,
    });
  } catch (err) {
    console.error("[TEST] Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Test: List all notification tokens ───────────────────────────────────
// GET /api/test/tokens
// Admin only: view all stored tokens for debugging
router.get("/tokens", adminAuth, async (req, res) => {
  try {
    const tokens = await prisma.notificationToken.findMany({
      select: {
        id: true,
        token: true,
        platform: true,
        role: true,
        userId: true,
        agentId: true,
        lastSeenAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    res.json({
      count: tokens.length,
      tokens: tokens.map((t) => ({
        ...t,
        tokenPrefix: t.token.substring(0, 20) + "…",
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
