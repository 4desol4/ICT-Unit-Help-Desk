// ─────────────────────────────────────────────────────────────────────────────
// PUSH NOTIFICATION TEST — Paste this into your browser console
// ─────────────────────────────────────────────────────────────────────────────

// 1. CHECK REGISTRATION STATUS
console.log("=== PUSH REGISTRATION STATUS ===");
console.log(
  "Auth token:",
  localStorage.getItem("ict_token") ? "✓ present" : "✗ missing",
);
console.log("User data:", localStorage.getItem("ict_user"));
console.log("Notification permission:", Notification.permission);

// 2. TEST SERVICE WORKER
console.log("\n=== SERVICE WORKER STATUS ===");
navigator.serviceWorker
  .getRegistration("/firebase-messaging-sw.js")
  .then((reg) => {
    if (reg) {
      console.log("✓ SW registered, scope:", reg.scope);
      console.log("  Installing:", reg.installing ? "yes" : "no");
      console.log("  Waiting:", reg.waiting ? "yes" : "no");
      console.log("  Active:", reg.active ? "yes" : "no");
      if (reg.active) {
        console.log("  [SW is ACTIVE and ready]");
      }
    } else {
      console.log("✗ No SW registration found");
    }
  })
  .catch((err) => console.error("Error checking SW:", err));

// 3. SEND TEST NOTIFICATION (Agent/Admin only)
async function sendTestNotification(recipientId = 8) {
  console.log("\n=== SENDING TEST NOTIFICATION ===");
  const token = localStorage.getItem("ict_token");
  if (!token) {
    console.error("✗ No auth token. Please login first.");
    return;
  }

  try {
    const response = await fetch(
      "https://ict-unit-help-desk.onrender.com/api/test/send-notification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientRole: "user",
          recipientId: recipientId,
          title: "Test Notification",
          body: "This is a test. Close the app to see the native popup!",
        }),
      },
    );

    const data = await response.json();
    console.log("Response:", data);

    if (response.ok) {
      console.log(`✓ Test notification sent to user ${recipientId}`);
      console.log("  Tokens found:", data.tokensFound);
      if (data.tokensFound > 0) {
        console.log("  Delivery results:", data.deliveryResults);
      }
    } else {
      console.log("✗ Error:", data.error);
    }
  } catch (err) {
    console.error("✗ Request failed:", err.message);
  }
}

// 4. LIST ALL TOKENS (Admin only)
async function listAllTokens() {
  console.log("\n=== LISTING ALL NOTIFICATION TOKENS ===");
  const token = localStorage.getItem("ict_token");
  if (!token) {
    console.error("✗ No auth token. Please login as Admin.");
    return;
  }

  try {
    const response = await fetch(
      "https://ict-unit-help-desk.onrender.com/api/test/tokens",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    if (response.ok) {
      console.log(`Found ${data.count} tokens:`);
      data.tokens.forEach((t) => {
        console.log(
          `  [${t.role.toUpperCase()}] ${t.tokenPrefix} (platform=${t.platform}, lastSeen=${t.lastSeenAt})`,
        );
      });
    } else {
      console.log("✗ Error:", data.error);
    }
  } catch (err) {
    console.error("✗ Request failed:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USAGE:
// ─────────────────────────────────────────────────────────────────────────────
// 1. Make sure you're logged in (User, Agent, or Admin)
// 2. Copy and paste this entire script into the browser console
// 3. Run: sendTestNotification(8)     // Send test to user 8
// 4. Or run: listAllTokens()          // See all registered tokens (Admin only)
// 5. Then close or minimize the app
// 6. You should see a native OS notification
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n✓ Test functions loaded!");
console.log("Commands:");
console.log("  sendTestNotification(recipientId)  — Send a test notification");
console.log(
  "  listAllTokens()                    — View all registered tokens (Admin)",
);
