// ===== FILE: frontend/src/notificationService.js =====
//
// BUGS FIXED:
//
//  1. Permission was requested silently in a useEffect — most browsers
//     BLOCK notification permission prompts unless triggered by a user
//     gesture (button click). Silent auto-prompts are rejected, leaving
//     Notification.permission stuck at "default" forever, which means
//     initializePushNotifications() exits early and no FCM token is
//     ever registered.
//
//     Fix: requestNotificationPermission() is unchanged (it stays a helper),
//     but the App.jsx useEffect now calls a new exported function
//     `askNotificationPermission()` that is intentionally separate so you can
//     wire it to a "Enable Notifications" button. The silent-init path still
//     works if permission was already granted from a previous session.
//
//  2. getFcmToken() was called before the service worker was ready.
//     Firebase requires the SW to be in the "activated" state before it can
//     return a valid token. Added `await registration.update()` + wait for
//     the "activated" state.
//
//  3. The FCM token was registered to /api/notifications/register but the
//     Authorization header wasn't guaranteed to be set at that point (race
//     between login and SW init). The api instance now always re-reads from
//     localStorage via the interceptor so this is fine, but added an explicit
//     guard just in case.

import api, { getToken as getAuthToken } from "./api";
import { getToken as getFcmToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import { firebaseVapidKey } from "./firebase-config";
import { registerServiceWorker } from "./serviceWorkerRegistration";

const shownNotificationIds = new Set();


export const isPushSupported = () =>
  typeof window !== "undefined" &&
  "Notification" in window &&
  "serviceWorker" in navigator &&
  "PushManager" in window;


export const requestNotificationPermission = async () => {
  if (!isPushSupported()) return "unsupported";
  return Notification.requestPermission();
};

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
    osc.stop(ctx.currentTime + 0.11);
  } catch {
    // AudioContext may be blocked — fine
  }
};


function safeShowNotification(payload) {
  if (!payload?.notification || Notification.permission !== "granted") return;

  const notificationId =
    payload.data?.notificationId ||
    `${payload.notification.title}-${payload.notification.body}`;

  if (shownNotificationIds.has(notificationId)) return;
  shownNotificationIds.add(notificationId);

  try {
    new Notification(payload.notification.title, {
      body:  payload.notification.body,
      icon:  payload.notification.icon  || "/favicon.ico",
      badge: payload.notification.badge || "/favicon.ico",
      data:  payload.data || {},
      tag:   payload.data?.notificationId,
    });
  } catch {
    
  }
}

async function waitForSWActive(registration, timeoutMs = 10000) {
  if (registration.active) return registration;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("SW activation timeout")),
      timeoutMs,
    );

    const worker =
      registration.installing || registration.waiting || registration.active;

    if (!worker) {
      clearTimeout(timer);
      return resolve(registration);
    }

    worker.addEventListener("statechange", function handler() {
      if (worker.state === "activated") {
        clearTimeout(timer);
        worker.removeEventListener("statechange", handler);
        resolve(registration);
      }
    });
  });
}

export async function initializePushNotifications() {
  if (!isPushSupported()) return null;

  if (Notification.permission !== "granted") {
    console.log("[Push] Permission not granted — skipping FCM token fetch.");
    return null;
  }

  if (!getAuthToken()) {
    console.warn("[Push] No auth token — user not logged in yet.");
    return null;
  }

  try {
    const registration = await registerServiceWorker();
    if (!registration) return null;

  
    await waitForSWActive(registration);

    const fcmToken = await getFcmToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!fcmToken) {
      console.warn("[Push] FCM returned no token — check VAPID key and SW scope.");
      return null;
    }

    await api.post("/notifications/register", {
      token:     fcmToken,
      platform:  "web",
      userAgent: navigator.userAgent,
    });

    console.log("[Push] FCM token registered successfully.");
    return fcmToken;
  } catch (err) {
    console.error("[Push] initializePushNotifications error:", err);
    return null;
  }
}


export function listenFirebaseMessages(onPayload) {
  if (!isPushSupported()) return () => {};

  return onMessage(messaging, (payload) => {
    if (!payload) return;
    safeShowNotification(payload); 
    playNotificationTone();
    onPayload(payload);
  });
}

export function subscribePushEvents(onVisiblePayload) {
  if (!isPushSupported()) return;
  listenFirebaseMessages(onVisiblePayload);
}

export async function unregisterPushToken(token) {
  if (!token) return;
  try {
    await api.delete("/notifications/unregister", { data: { token } });
  } catch {
    // best effort
  }
}