// ─────────────────────────────────────────────────────────────────────────────
// MOBILE PUSH NOTIFICATION DIAGNOSTICS
// ─────────────────────────────────────────────────────────────────────────────
// Paste this into your mobile browser console to debug push issues

console.log("=== MOBILE PUSH DIAGNOSTICS ===\n");

// 1. Detect mobile platform
const ua = navigator.userAgent;
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
const isAndroid = /Android/i.test(ua);
const isIOS = /iPhone|iPad|iPod/i.test(ua);

console.log("Platform Detection:");
console.log("  User Agent:", ua);
console.log("  Is Mobile:", isMobile ? "✓ YES" : "✗ NO");
console.log("  Platform:", isAndroid ? "Android" : isIOS ? "iOS" : "Unknown");

// 2. Check Push API support
console.log("\nPush API Support:");
console.log(
  "  Service Worker:",
  "serviceWorker" in navigator ? "✓ supported" : "✗ NOT supported",
);
console.log(
  "  PushManager:",
  "PushManager" in window ? "✓ supported" : "✗ NOT supported",
);
console.log(
  "  Notification API:",
  "Notification" in window ? "✓ supported" : "✗ NOT supported",
);

// 3. Check current permissions
console.log("\nCurrent Permissions:");
console.log("  Notification permission:", Notification.permission);

// 4. Check service worker status
console.log("\nService Worker Status:");
navigator.serviceWorker
  .getRegistration("/firebase-messaging-sw.js")
  .then((reg) => {
    if (reg) {
      console.log("  ✓ SW registered at:", reg.scope);
      console.log("    - Installing:", reg.installing ? "yes" : "no");
      console.log("    - Waiting:", reg.waiting ? "yes" : "no");
      console.log("    - Active:", reg.active ? "yes" : "no");

      if (!reg.active && (reg.installing || reg.waiting)) {
        console.log("    ⚠️  SW not yet active. It may activate soon.");
        console.log("    Try refreshing the page in a few seconds.");
      }
    } else {
      console.log(
        "  ✗ No SW registration found. App may not be properly installed on this device.",
      );
    }
  })
  .catch((err) => console.error("  Error checking SW:", err));

// 5. Check auth token
console.log("\nAuthentication:");
const token = localStorage.getItem("ict_token");
console.log("  Auth token:", token ? "✓ present" : "✗ missing");
const userData = JSON.parse(localStorage.getItem("ict_user") || "null");
console.log("  User data:", userData);

// 6. Check if browser supports web push properly
console.log("\nWeb Push Support Details:");
if (isAndroid) {
  console.log("  Device: Android");
  console.log("  ✓ Chrome on Android supports push notifications");
  console.log("  ✓ Firefox on Android supports push notifications");
  console.log("  ✗ Samsung Internet may have limited FCM support");
  console.log("\n  To fix Android push:");
  console.log("    1. Open Chrome Settings → Apps → Notifications");
  console.log("    2. Make sure Chrome has permission to show notifications");
  console.log(
    "    3. Open your app and grant notification permission when prompted",
  );
  console.log("    4. Minimize or lock the device, then send a test message");
} else if (isIOS) {
  console.log("  Device: iOS");
  console.log(
    "  ⚠️  IMPORTANT: iOS Safari has LIMITED push notification support",
  );
  console.log(
    "  ✗ Native push notifications NOT fully supported on iOS Safari",
  );
  console.log("  ✓ Use Progressive Web App (PWA) for better iOS support");
  console.log("\n  To use on iOS:");
  console.log("    1. Add app to home screen (install as PWA)");
  console.log("    2. Open from home screen, not Safari");
  console.log("    3. Grant notification permission");
  console.log("    4. Notifications should work better as PWA");
} else {
  console.log("  Device: " + (isMobile ? "Mobile (unknown)" : "Desktop"));
}

// 7. Request permission if not granted
async function enableNotificationsOnMobile() {
  console.log("\n=== ENABLING NOTIFICATIONS ===");

  if (Notification.permission === "granted") {
    console.log("✓ Notifications already enabled");
    return;
  }

  if (Notification.permission === "denied") {
    console.log(
      "✗ Notifications denied by user. Cannot re-enable without manual browser settings change.",
    );
    console.log(
      "  Go to browser settings and manually enable notifications for this site.",
    );
    return;
  }

  console.log("⏳ Requesting notification permission...");
  const result = await Notification.requestPermission();
  console.log("Result:", result);

  if (result === "granted") {
    console.log("✓ Notifications enabled! Now trying to register push...");

    // Force re-registration
    const { initializePushNotifications } =
      await import("https://ict-unit-help-desk.vercel.app/assets/notificationService.js");
    await initializePushNotifications();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USAGE:
// ─────────────────────────────────────────────────────────────────────────────
// Copy and paste the entire script above into your mobile browser console.
// Then run the function below to fix permissions:
//
// enableNotificationsOnMobile()
//
// After that, close/minimize the app and send a test notification.
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n✓ Mobile diagnostics loaded!");
console.log("Next steps:");
if (isAndroid) {
  console.log("1. Verify Chrome has notification permission in OS settings");
  console.log("2. Run: enableNotificationsOnMobile()");
  console.log("3. Close/minimize the app and send a test");
} else if (isIOS) {
  console.log("1. Consider using PWA (add to home screen)");
  console.log("2. Run: enableNotificationsOnMobile()");
  console.log("3. Limitations: iOS Safari has limited push support");
} else {
  console.log("1. Run: enableNotificationsOnMobile()");
  console.log("2. Close the app and send a test");
}
