const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

function initFirebase() {
  if (admin.apps.length > 0) {
    
    return admin.apps[0];
  }

  let credential;

  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (keyPath) {
    const resolved = path.isAbsolute(keyPath)
      ? keyPath
      : path.join(process.cwd(), keyPath);

    if (fs.existsSync(resolved)) {
      const serviceAccount = JSON.parse(fs.readFileSync(resolved, "utf8"));
      credential = admin.credential.cert(serviceAccount);
    } else {
      console.warn(
        `[FCM] FIREBASE_SERVICE_ACCOUNT_JSON set to "${resolved}" but file not found.`,
      );
    }
  }

  
  if (!credential) {
    const projectId     = process.env.FIREBASE_PROJECT_ID;
    const clientEmail   = process.env.FIREBASE_CLIENT_EMAIL;
  
    const privateKey    = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

    if (projectId && clientEmail && privateKey) {
      credential = admin.credential.cert({ projectId, clientEmail, privateKey });
    } else {
      console.warn(
        "[FCM] No Firebase credentials found. " +
          "Set FIREBASE_SERVICE_ACCOUNT_JSON or " +
          "FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.",
      );
      return null;
    }
  }

  try {
    return admin.initializeApp({ credential });
  } catch (err) {
    console.error("[FCM] Firebase Admin init failed:", err.message);
    return null;
  }
}

const firebaseApp = initFirebase();


async function sendPushNotification(tokens, payload) {
  if (!firebaseApp) {
    console.warn("[FCM] Skipping push — Firebase not initialised.");
    return [];
  }

  if (!tokens || tokens.length === 0) {
    return [];
  }

  const { title, body, icon, badge, data = {} } = payload;

  // FCM data values must all be strings
  const stringData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v ?? "")]),
  );

  const message = {
    tokens,
    notification: { title, body },
    webpush: {
      notification: {
        title,
        body,
        icon:  icon  || "/favicon.ico",
        badge: badge || "/favicon.ico",
        requireInteraction: false,
      },
      fcmOptions: {
       
        link: stringData.clickAction || "/",
      },
    },
   
    data: stringData,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    const results = response.responses.map((r, i) => ({
      token: tokens[i],
      success: r.success,
      error:   r.error?.message,
    }));

    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
      console.warn(
        `[FCM] ${failed.length}/${tokens.length} tokens failed:`,
        failed.map((f) => `${f.token.slice(0, 20)}… → ${f.error}`),
      );
    }

    return results;
  } catch (err) {
    console.error("[FCM] sendEachForMulticast error:", err.message);
    return tokens.map((token) => ({ token, success: false, error: err.message }));
  }
}

async function cleanupInvalidTokens(prisma, dbTokens, results) {
  if (!results || results.length === 0) return;

  const INVALID_ERRORS = [
    "registration-token-not-registered",
    "invalid-registration-token",
    "invalid-argument",
  ];

  const invalidTokens = results
    .filter(
      (r) =>
        !r.success &&
        INVALID_ERRORS.some((e) => (r.error || "").toLowerCase().includes(e.replace(/-/g, ""))),
    )
    .map((r) => r.token);

  if (invalidTokens.length === 0) return;

  try {
    await prisma.notificationToken.deleteMany({
      where: { token: { in: invalidTokens } },
    });
    console.log(`[FCM] Removed ${invalidTokens.length} stale token(s).`);
  } catch (err) {
    console.warn("[FCM] Could not clean up stale tokens:", err.message);
  }
}

module.exports = { sendPushNotification, cleanupInvalidTokens };