const admin = require("firebase-admin");

function initFirebase() {
  if (admin.apps.length > 0) return admin.apps[0];

  let credential = null;

  // Try FIREBASE_SERVICE_ACCOUNT_JSON first
  // On Render this env var contains the RAW JSON text, not a file path.
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    const trimmed = rawJson.trim();
    if (trimmed.startsWith("{")) {
      // It is JSON content, parse it directly (Render case)
      try {
        credential = admin.credential.cert(JSON.parse(trimmed));
        console.log(
          "[FCM] Initialised from FIREBASE_SERVICE_ACCOUNT_JSON (JSON content).",
        );
      } catch (e) {
        console.error(
          "[FCM] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:",
          e.message,
        );
      }
    } else {
      // It is a file path (local dev case)
      try {
        const fs = require("fs");
        const path = require("path");
        const resolved = path.isAbsolute(trimmed)
          ? trimmed
          : path.join(process.cwd(), trimmed);
        if (fs.existsSync(resolved)) {
          credential = admin.credential.cert(
            JSON.parse(fs.readFileSync(resolved, "utf8")),
          );
          console.log("[FCM] Initialised from service account file:", resolved);
        } else {
          console.warn("[FCM] File not found:", resolved);
        }
      } catch (e) {
        console.error("[FCM] Failed to read service account file:", e.message);
      }
    }
  }

  // Fallback: individual env vars
  if (!credential) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(
      /\\n/g,
      "\n",
    );

    if (projectId && clientEmail && privateKey) {
      try {
        credential = admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        });
        console.log("[FCM] Initialised from individual FIREBASE_* env vars.");
      } catch (e) {
        console.error(
          "[FCM] Failed to init from individual env vars:",
          e.message,
        );
      }
    }
  }

  if (!credential) {
    console.error(
      "[FCM] No Firebase credentials found.\n" +
        "  Set FIREBASE_SERVICE_ACCOUNT_JSON to the raw JSON content of your service account file,\n" +
        "  OR set FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.",
    );
    return null;
  }

  try {
    const app = admin.initializeApp({ credential });
    console.log("[FCM] Firebase Admin SDK ready.");
    return app;
  } catch (err) {
    console.error("[FCM] initializeApp error:", err.message);
    return null;
  }
}

const firebaseApp = initFirebase();

async function sendPushNotification(tokens, payload) {
  if (!firebaseApp) {
    console.warn("[FCM] Skipping push - Firebase not initialised.");
    return [];
  }

  const validTokens = (tokens || []).filter(Boolean);
  if (validTokens.length === 0) {
    console.warn("[FCM] No valid tokens provided for push.");
    return [];
  }

  const { title, body, icon, badge, data = {} } = payload;

  const stringData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v ?? "")]),
  );

  const message = {
    tokens: validTokens,
    notification: { title, body },
    webpush: {
      notification: {
        title,
        body,
        icon: icon || "/favicon.ico",
        badge: badge || "/favicon.ico",
        vibrate: [200, 100, 200],
        requireInteraction: false,
      },
      fcmOptions: {
        link: stringData.clickAction || "/",
      },
    },
    data: stringData,
  };

  try {
    console.log("[FCM] Sending push to", validTokens.length, "token(s)...");
    const response = await admin.messaging().sendEachForMulticast(message);
    const results = response.responses.map((r, i) => ({
      token: validTokens[i],
      success: r.success,
      error: r.error ? r.error.message : null,
    }));

    const ok = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success);
    console.log(
      "[FCM] ✅ Push delivery: " +
        ok +
        "/" +
        validTokens.length +
        " succeeded.",
    );
    if (failed.length > 0) {
      console.warn(
        "[FCM] ❌ Failed tokens (" + failed.length + "):",
        failed.map((f) => ({
          token: f.token.substring(0, 20) + "…",
          error: f.error,
        })),
      );
    }
    return results;
  } catch (err) {
    console.error("[FCM] ❌ sendEachForMulticast error:", err.message);
    return validTokens.map((token) => ({
      token,
      success: false,
      error: err.message,
    }));
  }
}

async function cleanupInvalidTokens(prisma, dbTokens, results) {
  if (!results || results.length === 0) return;

  const STALE = [
    "registration-token-not-registered",
    "invalid-registration-token",
    "invalid-argument",
  ];

  const staleTokens = results
    .filter(function (r) {
      return (
        !r.success &&
        STALE.some(function (e) {
          return (r.error || "").toLowerCase().includes(e.replace(/-/g, ""));
        })
      );
    })
    .map(function (r) {
      return r.token;
    });

  if (staleTokens.length === 0) return;

  try {
    await prisma.notificationToken.deleteMany({
      where: { token: { in: staleTokens } },
    });
    console.log("[FCM] Removed " + staleTokens.length + " stale token(s).");
  } catch (err) {
    console.warn("[FCM] Could not clean stale tokens:", err.message);
  }
}

module.exports = { sendPushNotification, cleanupInvalidTokens };
