importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyBO5J9sOfCkJCqyXs3G47Y_hzqEdi3zNHo",
  authDomain: "ict-helpdesk-e983c.firebaseapp.com",
  projectId: "ict-helpdesk-e983c",
  storageBucket: "ict-helpdesk-e983c.firebasestorage.app",
  messagingSenderId: "1072899448523",
  appId: "1:1072899448523:web:c3da300af9bfc3f845c54e",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const notificationId =
    payload.data?.notificationId ||
    `${payload.notification?.title}-${payload.notification?.body}`;

  const title = payload.notification?.title || "ICT Help Desk";

  const options = {
    body: payload.notification?.body || "You have a new notification.",

    icon: payload.notification?.icon || "/favicon.ico",

    badge: payload.notification?.badge || "/favicon.ico",

    data: {
      ...payload.data,

      click_action: payload.data?.click_action || "/",
    },

    tag: notificationId,

    renotify: false,

    requireInteraction: false,

    vibrate: [200, 100, 200],
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickAction = event.notification.data?.click_action || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        const targetUrl = new URL(clickAction, self.location.origin).href;

        for (const client of clientList) {
          const clientUrl = client.url.split("?")[0].split("#")[0];

          if (clientUrl === targetUrl && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");

  event.waitUntil(self.clients.claim());
});

self.addEventListener("install", (event) => {
  console.log("[SW] Installed");

  self.skipWaiting();
});
