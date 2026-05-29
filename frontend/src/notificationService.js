import api, { getToken as getAuthToken } from "./api";
import {
  getToken as getFcmToken,
  onMessage,
  deleteToken,
} from "firebase/messaging";
import { messaging } from "./firebase";
import { firebaseVapidKey } from "./firebase-config";

const shownNotificationIds = new Set();

// ── Support check ─────────────────────────────────────────────────────────────
export const isPushSupported = () =>
  typeof window !== "undefined" &&
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window;

// ── Permission ────────────────────────────────────────────────────────────────
export const requestNotificationPermission = async () => {
  if (!isPushSupported()) return "unsupported";
  return Notification.requestPermission();
};

// ── Tone ──────────────────────────────────────────────────────────────────────
export const playNotificationTone = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // AudioContext may be blocked — not critical
  }
};

// ── Register service worker ───────────────────────────────────────────────────
async function getSWRegistration() {
  if (!("serviceWorker" in navigator)) {
    console.log("[SW] Service Worker API not available");
    return null;
  }
  try {
    console.log("[SW] Checking for existing registration...");

    // Reuse existing registration if already registered
    const existing = await navigator.serviceWorker.getRegistration(
      "/firebase-messaging-sw.js",
    );
    if (existing) {
      console.log("[SW] ✅ Found existing registration, updating...");
      await existing.update(); // pick up any new SW version
      return existing;
    }

    console.log("[SW] No existing registration, registering new SW...");
    const reg = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" },
      // No { type: "module" } — SW uses importScripts (classic mode)
    );
    console.log("[SW] ✅ Registered, scope:", reg.scope);
    return reg;
  } catch (err) {
    console.error("[SW] ❌ Registration failed:", err.message);
    return null;
  }
}

// Wait until the SW is active before asking Firebase for a token
async function waitForSWActive(reg, timeoutMs = 12000) {
  if (!reg) {
    console.warn("[SW] No registration provided");
    return false;
  }

  if (reg.active) {
    console.log("[SW] ✅ SW already active");
    return true;
  }

  console.log("[SW] ⏳ Waiting for SW to become active...");

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.warn("[SW] ⚠️  Activation timeout — proceeding anyway");
      resolve(false);
    }, timeoutMs);

    const worker = reg.installing || reg.waiting;
    if (!worker) {
      console.warn("[SW] No installing or waiting worker found");
      clearTimeout(timer);
      resolve(false);
      return;
    }

    console.log("[SW] Found worker, waiting for activation...");

    worker.addEventListener("statechange", function h() {
      console.log("[SW] Worker state changed to:", worker.state);
      if (worker.state === "activated") {
        console.log("[SW] ✅ SW now active!");
        clearTimeout(timer);
        worker.removeEventListener("statechange", h);
        resolve(true);
      }
    });
  });
}

// ── Main: get FCM token & register with backend ───────────────────────────────
export async function initializePushNotifications() {
  console.log("[Push] initializePushNotifications started");

  if (!isPushSupported()) {
    console.log("[Push] Push not supported in this browser.");
    return null;
  }

  console.log("[Push] Notification permission:", Notification.permission);

  if (Notification.permission !== "granted") {
    console.log("[Push] Permission not granted — skipping.");
    return null;
  }

  const authToken = getAuthToken();
  console.log("[Push] Auth token present:", Boolean(authToken));

  if (!authToken) {
    console.warn("[Push] No auth token — user not logged in.");
    return null;
  }

  if (!firebaseVapidKey) {
    console.error(
      "[Push] VITE_FIREBASE_VAPID_KEY is missing.\n" +
        "  → Add it in Vercel Dashboard → Settings → Environment Variables\n" +
        "  → Then redeploy so Vite bakes it into the build.",
    );
    return null;
  }

  console.log(
    "[Push] Firebase VAPID key configured:",
    firebaseVapidKey.substring(0, 20) + "...",
  );

  try {
    console.log("[Push] Fetching or registering service worker...");
    const reg = await getSWRegistration();
    console.log(
      "[Push] SW registration result:",
      Boolean(reg),
      reg?.scope || null,
    );

    if (!reg) {
      console.error("[Push] SW registration failed.");
      return null;
    }

    await waitForSWActive(reg);

    console.log("[Push] Requesting FCM token...");
    const fcmToken = await getFcmToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: reg,
    });

    if (!fcmToken) {
      console.error(
        "[Push] FCM returned no token. Check:\n" +
          "  1. VITE_FIREBASE_VAPID_KEY is correct\n" +
          "  2. firebase-messaging-sw.js has your real Firebase config (not placeholders)\n" +
          "  3. You are on HTTPS (required for push — localhost is the only exception)\n" +
          "  4. The SW is active: DevTools → Application → Service Workers",
      );
      return null;
    }

    console.log("[Push] FCM token:", fcmToken.substring(0, 20) + "…");

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const platformType = isMobile ? "mobile-web" : "web";
    console.log("[Push] Device detected:", isMobile ? "mobile" : "desktop");
    console.log("[Push] Platform type:", platformType);
    console.log("[Push] User agent:", navigator.userAgent);

    console.log("[Push] Registering token with backend...");
    const registerResponse = await api.post("/notifications/register", {
      token: fcmToken,
      platform: platformType,
      userAgent: navigator.userAgent,
    });

    console.log(
      "[Push] Backend registration response:",
      registerResponse?.status,
      registerResponse?.data,
    );
    console.log("[Push] ✅ Token registered with backend.");
    console.log(
      "[Push] 🎉 Push notifications fully initialized!",
      "Background messages will show as OS notifications when app is closed/minimized.",
    );
    return fcmToken;
  } catch (err) {
    console.error(
      "[Push] initializePushNotifications error:",
      err?.message || err,
    );
    return null;
  }
}

// ── Foreground message listener ───────────────────────────────────────────────
// Firebase does NOT show a native OS notification when the tab is open — we
// handle it here and pass it to App.jsx which renders the in-app toast.
export function listenFirebaseMessages(onPayload) {
  if (!isPushSupported()) {
    console.log("[Push] Push not supported—skipping foreground listener");
    return () => {};
  }

  console.log("[Push] Setting up foreground message listener...");

  return onMessage(messaging, (payload) => {
    console.log("[Push] 📬 Foreground message received:", payload);

    if (!payload) {
      console.warn("[Push] Payload is null/empty");
      return;
    }

    // Deduplicate
    const id =
      payload.data?.notificationId ||
      `${payload.notification?.title}-${payload.notification?.body}`;

    console.log("[Push] Message ID:", id);

    if (shownNotificationIds.has(id)) {
      console.warn(
        "[Push] ⏭️  Message already shown recently—skipping duplicate",
      );
      return;
    }

    shownNotificationIds.add(id);
    setTimeout(() => shownNotificationIds.delete(id), 30000);

    console.log("[Push] 🔔 Playing notification tone...");
    playNotificationTone();

    console.log("[Push] 📨 Calling onPayload callback...");
    onPayload(payload);
  });
}

// ── Unregister ────────────────────────────────────────────────────────────────
export async function unregisterPushNotifications() {
  try {
    const reg = await navigator.serviceWorker
      .getRegistration("/firebase-messaging-sw.js")
      .catch(() => null);
    if (!reg) return;
    const token = await getFcmToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: reg,
    }).catch(() => null);
    if (token) {
      await deleteToken(messaging).catch(() => {});
      await api
        .delete("/notifications/unregister", { data: { token } })
        .catch(() => {});
    }
  } catch {
    // best effort
  }
}
