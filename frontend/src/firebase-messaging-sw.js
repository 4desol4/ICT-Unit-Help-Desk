import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { firebaseConfig } from "./firebase-config";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  const notificationTitle =
    payload.notification?.title || "New Help Desk alert";
  const notificationOptions = {
    body:
      payload.notification?.body || "Open the app to see the latest update.",
    icon: payload.notification?.icon || "/favicon.ico",
    badge: payload.notification?.badge || "/favicon.ico",
    data: {
      ...payload.data,
      click_action: payload.data?.clickAction || "/",
    },
    tag: payload.data?.notificationId,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickAction = event.notification.data?.click_action || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const url = new URL(clickAction, self.location.origin).href;

        for (const client of clientList) {
          if (
            client.url === url ||
            client.url === self.location.origin + clickAction
          ) {
            return client.focus();
          }
        }

        return self.clients.openWindow(url);
      }),
  );
});
