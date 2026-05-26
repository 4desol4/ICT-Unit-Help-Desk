// frontend/src/notificationService.js
import api, { getToken as getAuthToken } from "./api";
import { getToken as getFcmToken, onMessage, deleteToken } from "firebase/messaging";
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
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
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
  if (!("serviceWorker" in navigator)) return null;
  try {
    // Reuse existing registration if already registered
    const existing = await navigator.serviceWorker.getRegistration(
      "/firebase-messaging-sw.js",
    );
    if (existing) {
      await existing.update(); // pick up any new SW version
      return existing;
    }
    const reg = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" },
      // No { type: "module" } — SW uses importScripts (classic mode)
    );
    console.log("[SW] Registered, scope:", reg.scope);
    return reg;
  } catch (err) {
    console.error("[SW] Registration failed:", err.message);
    return null;
  }
}

// Wait until the SW is active before asking Firebase for a token
async function waitForSWActive(reg, timeoutMs = 12000) {
  if (reg.active) return true;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.warn("[SW] Activation timeout — proceeding anyway");
      resolve(false);
    }, timeoutMs);

    const worker = reg.installing || reg.waiting;
    if (!worker) { clearTimeout(timer); resolve(false); return; }

    worker.addEventListener("statechange", function h() {
      if (worker.state === "activated") {
        clearTimeout(timer);
        worker.removeEventListener("statechange", h);
        resolve(true);
      }
    });
  });
}

// ── Main: get FCM token & register with backend ───────────────────────────────
export async function initializePushNotifications() {
  if (!isPushSupported()) {
    console.log("[Push] Push not supported in this browser.");
    return null;
  }
  if (Notification.permission !== "granted") {
    console.log("[Push] Permission not granted — skipping.");
    return null;
  }
  if (!getAuthToken()) {
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

  try {
    const reg = await getSWRegistration();
    if (!reg) { console.error("[Push] SW registration failed."); return null; }

    await waitForSWActive(reg);

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

    await api.post("/notifications/register", {
      token:     fcmToken,
      platform:  /Mobi|Android/i.test(navigator.userAgent) ? "mobile-web" : "web",
      userAgent: navigator.userAgent,
    });

    console.log("[Push] ✅ Token registered with backend.");
    return fcmToken;
  } catch (err) {
    console.error("[Push] initializePushNotifications error:", err?.message || err);
    return null;
  }
}

// ── Foreground message listener ───────────────────────────────────────────────
// Firebase does NOT show a native OS notification when the tab is open — we
// handle it here and pass it to App.jsx which renders the in-app toast.
export function listenFirebaseMessages(onPayload) {
  if (!isPushSupported()) return () => {};

  return onMessage(messaging, (payload) => {
    if (!payload) return;

    // Deduplicate
    const id =
      payload.data?.notificationId ||
      `${payload.notification?.title}-${payload.notification?.body}`;
    if (shownNotificationIds.has(id)) return;
    shownNotificationIds.add(id);
    setTimeout(() => shownNotificationIds.delete(id), 30000);

    playNotificationTone();
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
      await api.delete("/notifications/unregister", { data: { token } }).catch(() => {});
    }
  } catch {
    // best effort
  }
}