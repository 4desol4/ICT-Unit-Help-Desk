export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      new URL("./firebase-messaging-sw.js", import.meta.url),
      { type: "module" },
    );

    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
}
