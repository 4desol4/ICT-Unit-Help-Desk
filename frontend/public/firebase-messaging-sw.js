importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
);

console.log("[SW] Service Worker initializing...");

// ▼▼▼ PASTE YOUR ACTUAL VALUES BELOW — replace every placeholder ▼▼▼
firebase.initializeApp({
  apiKey: "AIzaSyBO5J9sOfCkJCqyXs3G47Y_hzqEdi3zNHo",
  authDomain: "ict-helpdesk-e983c.firebaseapp.com",
  projectId: "ict-helpdesk-e983c",
  storageBucket: "ict-helpdesk-e983c.firebasestorage.app",
  messagingSenderId: "1072899448523",
  appId: "1:1072899448523:web:c3da300af9bfc3f845c54e",
});
// ▲▲▲ PASTE YOUR ACTUAL VALUES ABOVE ▲▲▲

console.log("[SW] Firebase initialized");

const messaging = firebase.messaging();
console.log("[SW] Firebase messaging instance created");

// Background message handler — fires when the app tab is CLOSED or hidden
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] ✅ Background message received:", payload);

  const title = payload.notification?.title || "ICT Help Desk";
  const body = payload.notification?.body || "You have a new notification.";

  console.log("[SW] 📋 Notification details:", { title, body });

  const options = {
    body,
    icon: payload.notification?.icon || "/favicon.ico",
    badge: payload.notification?.badge || "/favicon.ico",

    // Android-specific options for mobile notification support
    tag: payload.data?.notificationId || title,
    requireInteraction: false,

    // Mobile-friendly vibration pattern (in milliseconds)
    vibrate: [200, 100, 200],

    // Android notification priority (high = shows even on do-not-disturb)
    priority: "high",

    // Allow notification to be dismissible on Android
    actions: [
      {
        action: "open",
        title: "Open",
      },
      {
        action: "close",
        title: "Dismiss",
      },
    ],

    data: {
      ...payload.data,
      click_action: payload.data?.clickAction || "/",
      // Extra data for Android
      timestamp: new Date().toISOString(),
    },

    // Sound and visual options
    sound: "/notification-sound.mp3",
    silent: false,
  };

  console.log("[SW] 🔔 Calling showNotification with options:", options);

  self.registration
    .showNotification(title, options)
    .then(() => {
      console.log("[SW] ✅ OS notification shown successfully");
    })
    .catch((err) => {
      console.error("[SW] ❌ Failed to show notification:", err);
    });
});

// Handle notification click — open or focus the correct tab
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] 👆 Notification clicked:", event);
  event.notification.close();

  const clickAction = event.notification.data?.click_action || "/";
  const targetUrl = new URL(clickAction, self.location.origin).href;

  console.log("[SW] Navigating to:", targetUrl);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        console.log("[SW] Found", clientList.length, "open window(s)");

        // If the target page is already open — just focus it
        for (const client of clientList) {
          const clientUrl = new URL(client.url).pathname;
          const targetPath = new URL(targetUrl).pathname;
          console.log(
            "[SW] Comparing client path:",
            clientUrl,
            "vs target path:",
            targetPath,
          );
          if (clientUrl === targetPath && "focus" in client) {
            console.log("[SW] ✅ Found matching window, focusing...");
            return client.focus();
          }
        }
        // Otherwise open a new tab
        console.log("[SW] No matching window found, opening new tab...");
        return self.clients.openWindow(targetUrl);
      }),
  );
});

console.log("[SW] ✅ Service Worker fully initialized and ready");
