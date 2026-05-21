const admin = require("firebase-admin");

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (error) {
      console.error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON", error);
      throw error;
    }
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    return require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  }

  throw new Error(
    "Missing Firebase service account credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.",
  );
}

let firebaseApp;
function initFirebaseAdmin() {
  if (!firebaseApp) {
    const serviceAccount = loadServiceAccount();
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return firebaseApp;
}

function buildMessage(tokens, payload) {
  return {
    tokens,
    notification: {
      title: payload.title,
      body: payload.body,
      image: payload.image,
    },
    data: payload.data || {},
    android: {
      notification: {
        sound: "default",
        clickAction: payload.data?.clickAction || "/",
        tag: payload.data?.notificationId,
      },
    },
    webpush: {
      headers: {
        Urgency: "high",
      },
      notification: {
        icon: payload.icon || "/favicon.ico",
        badge: payload.badge || "/favicon.ico",
        tag: payload.data?.notificationId,
        click_action: payload.data?.clickAction || "/",
      },
    },
  };
}

async function sendPushNotification(tokens, payload) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return { successCount: 0, failureCount: 0, responses: [] };
  }

  initFirebaseAdmin();
  const message = buildMessage(tokens, payload);
  const result = await admin.messaging().sendMulticast(message);

  return result;
}

async function cleanupInvalidTokens(prisma, tokens, result) {
  if (!result || !result.responses || tokens.length === 0) return;

  const invalidTokens = tokens
    .map((record, index) => ({ record, response: result.responses[index] }))
    .filter(({ response }) => !response.success)
    .map(({ record }) => record.token);

  if (invalidTokens.length > 0) {
    await prisma.notificationToken.deleteMany({
      where: {
        token: { in: invalidTokens },
      },
    });
  }
}

module.exports = {
  sendPushNotification,
  cleanupInvalidTokens,
};
