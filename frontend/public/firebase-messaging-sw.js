importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
);

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

const messaging = firebase.messaging();

// Background message handler — fires when the app tab is CLOSED or hidden
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const title = payload.notification?.title || "ICT Help Desk";
  const options = {
    body: payload.notification?.body || "You have a new notification.",
    icon: payload.notification?.icon || "/favicon.ico",
    badge: payload.notification?.badge || "/favicon.ico",
    vibrate: [200, 100, 200],
    data: {
      ...payload.data,
      click_action: payload.data?.clickAction || "/",
    },
    // tag collapses duplicates — same tag = only 1 notification shown at a time
    tag: payload.data?.notificationId || title,
    requireInteraction: false,
  };

  self.registration.showNotification(title, options);
});

// Handle notification click — open or focus the correct tab
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickAction = event.notification.data?.click_action || "/";
  const targetUrl = new URL(clickAction, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If the target page is already open — just focus it
        for (const client of clientList) {
          const clientUrl = new URL(client.url).pathname;
          const targetPath = new URL(targetUrl).pathname;
          if (clientUrl === targetPath && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        return self.clients.openWindow(targetUrl);
      }),
  );
});
