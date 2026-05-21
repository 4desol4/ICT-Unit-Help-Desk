import api, { getToken } from "./api";
import { getToken as getFcmToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import { firebaseVapidKey } from "./firebase-config";
import { registerServiceWorker } from "./serviceWorkerRegistration";

const shownNotificationIds = new Set();

export const isPushSupported = () => {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
};

export const requestNotificationPermission = async () => {
  if (!isPushSupported()) return "unsupported";

  const permission = await Notification.requestPermission();

  return permission;
};

export const playNotificationTone = () => {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(520, context.currentTime);
    gain.gain.setValueAtTime(0.12, context.currentTime);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.11);
  } catch (error) {
    console.warn("Notification tone failed:", error);
  }
};

function safeShowNotification(payload) {
  if (
    !payload ||
    !payload.notification ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const notificationId =
    payload.data?.notificationId ||
    `${payload.notification.title}-${payload.notification.body}`;

  if (shownNotificationIds.has(notificationId)) {
    return;
  }

  shownNotificationIds.add(notificationId);

  const options = {
    body: payload.notification.body,
    icon: payload.notification.icon || "/favicon.ico",
    badge: payload.notification.badge || "/favicon.ico",
    data: payload.data || {},
    tag: payload.data?.notificationId,
  };

  try {
    new Notification(payload.notification.title, options);
  } catch (error) {
    console.warn("Browser notification failed:", error);
  }
}

export async function initializePushNotifications(user, role) {
  if (!isPushSupported()) return null;

  const registration = await registerServiceWorker();
  if (!registration) return null;

  if (Notification.permission !== "granted") {
    return null;
  }

  try {
    const fcmToken = await getFcmToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!fcmToken) {
      return null;
    }

    await api.post("/notifications/register", {
      token: fcmToken,
      platform: "web",
      userAgent: navigator.userAgent,
    });

    return fcmToken;
  } catch (error) {
    console.error("initializePushNotifications error:", error);
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
  } catch (error) {
    console.warn("Could not unregister push token:", error);
  }
}
