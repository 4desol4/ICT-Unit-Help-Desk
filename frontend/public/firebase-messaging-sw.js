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
  console.log("[SW] Payload notification:", payload.notification);
  console.log("[SW] Payload data:", payload.data);

  const title = payload.notification?.title || "ICT Help Desk";
  const body = payload.notification?.body || "You have a new notification.";
  const clickAction =
    payload.data?.clickAction || payload.data?.click_action || "/";
  const ticketId = payload.data?.ticketId || null;

  console.log("[SW] 📋 Notification details:", {
    title,
    body,
    clickAction,
    ticketId,
  });

  // Build notification options with comprehensive Android support
  const options = {
    // Core notification content
    body,
    icon: payload.notification?.icon || "/android-chrome-192x192.png",
    badge: payload.notification?.badge || "/favicon.ico",

    // Android: Notification grouping and priority
    tag: payload.data?.notificationId || `notification-${Date.now()}`,
    group: "ict-help-desk",
    groupSummary: false,

    // Android: Require interaction to dismiss (keeps notification visible)
    requireInteraction: true,

    // Android: Vibration pattern (ms: vibrate, pause, vibrate)
    vibrate: [200, 100, 200, 100, 200],

    // Android: High priority ensures notification shows in heads-up format
    urgency: "high",

    // Actions for user interaction
    actions: [
      {
        action: "open",
        title: "Open",
        icon: "/favicon.ico",
      },
      {
        action: "close",
        title: "Dismiss",
        icon: "/favicon.ico",
      },
    ],

    // Data passed to click handler
    data: {
      ...payload.data,
      click_action: clickAction,
      ticketId: ticketId,
      timestamp: new Date().toISOString(),
    },

    // Sound and visual feedback
    sound: "/notification-sound.mp3",
    silent: false,

    // Android: Direct reply capability
    renotify: true,

    // Android: Keep notification in tray
    persistent: true,

    // Direct notification badge customization for Android
    badge: "/android-chrome-192x192.png",
  };

  console.log(
    "[SW] 🔔 Calling showNotification with options:",
    JSON.stringify(options, null, 2),
  );

  self.registration
    .showNotification(title, options)
    .then(() => {
      console.log("[SW] ✅ OS notification shown successfully");
    })
    .catch((err) => {
      console.error("[SW] ❌ Failed to show notification:", err, err.stack);
    });
});

// Handle notification click — open or focus the correct tab
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] 👆 Notification clicked:", event);
  console.log("[SW] Notification action:", event.action);
  console.log("[SW] Notification data:", event.notification.data);

  // Only handle 'open' action; 'close' just dismisses
  if (event.action === "close") {
    console.log("[SW] User clicked dismiss");
    event.notification.close();
    return;
  }

  event.notification.close();

  // Get the click action from notification data (includes query params like ?ticketId=10)
  const clickAction =
    event.notification.data?.click_action ||
    event.notification.data?.clickAction ||
    "/";
  const targetUrl = new URL(clickAction, self.location.origin).href;

  console.log("[SW] Click action from data:", clickAction);
  console.log("[SW] Full target URL:", targetUrl);

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        console.log("[SW] Found", clientList.length, "open window(s)");

        // Priority 1: Look for app already running
        for (const client of clientList) {
          console.log("[SW] Checking client URL:", client.url);
          if ("focus" in client) {
            console.log(
              "[SW] ✅ Focusing existing window and navigating to:",
              targetUrl,
            );
            client.focus();
            // Send message to client to handle navigation
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              targetUrl: targetUrl,
              clickAction: clickAction,
            });
            return;
          }
        }

        // Priority 2: No window found, open new one with target URL
        console.log(
          "[SW] No existing window found, opening new window with URL:",
          targetUrl,
        );
        return self.clients.openWindow(targetUrl);
      })
      .catch((err) => {
        console.error("[SW] Error handling notification click:", err);
        return self.clients.openWindow("/");
      }),
  );
});

// Handle notification dismiss/close
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed by user:", event.notification.tag);
});

console.log("[SW] ✅ Service Worker fully initialized and ready");
