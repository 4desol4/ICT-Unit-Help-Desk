importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");


firebase.initializeApp({
  apiKey:            "PASTE_YOUR_FIREBASE_API_KEY_HERE",
  authDomain:        "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId:         "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket:     "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId:             "PASTE_YOUR_APP_ID_HERE",
});

const messaging = firebase.messaging();

// ── Background message handler ────────────────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "ICT Help Desk";
  const options = {
    body:  payload.notification?.body  || "You have a new notification.",
    icon:  payload.notification?.icon  || "/favicon.ico",
    badge: payload.notification?.badge || "/favicon.ico",
    data: {
      ...payload.data,
      click_action: payload.data?.clickAction || "/",
    },
    
    tag: payload.data?.notificationId || title,
    requireInteraction: false,
  };

  self.registration.showNotification(title, options);
});


self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickAction = event.notification.data?.click_action || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const target = new URL(clickAction, self.location.origin).href;

        for (const client of clientList) {
          const clientUrl = client.url.split("?")[0].split("#")[0];
          if (clientUrl === target && "focus" in client) {
            return client.focus();
          }
        }

        return self.clients.openWindow(target);
      }),
  );
});