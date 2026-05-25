export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
  
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    console.log("[SW] Registered:", registration.scope);

    return registration;
  } catch (error) {
    console.error("[SW] Registration failed:", error);
    return null;
  }
}