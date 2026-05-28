# Push Notification Testing Guide

## Overview

This guide helps you verify that native OS push notifications (popups) are working correctly when your app is minimized or closed.

---

## Prerequisites

✅ Frontend deployed to Vercel  
✅ Backend running on Render  
✅ Browser notifications permission **granted** for your site  
✅ Service worker registered (check DevTools → Application → Service Workers)

---

## Test Scenario 1: Background Push (Desktop)

### Setup

1. **Open Chrome** on your desktop.
2. **Login** to your app (User, Agent, or Admin).
3. **Watch the browser console** for these logs:
   ```
   [Push] initializePushNotifications started
   [Push] FCM token: [token-prefix]…
   [Push] ✅ Token registered with backend.
   ```
4. **Minimize or close Chrome completely** (but don't force-quit).

### Send a Push

- **On Agent side**: Send a message to a user's ticket.
- **On User side**: Send a message that will trigger an agent notification.
- **Backend check**: Look at Render logs for:
  ```
  [Notifications] 🔔 Register attempt: role=user, id=8, ...
  [Messages] Agent message on #...: found N user token(s) for user 8
  [FCM] Sending push to 1 token(s)...
  [FCM] ✅ Push delivery: 1/1 succeeded.
  ```

### Expected Result ✓

- **Native popup appears** in your OS notification center (like WhatsApp or ROG Gaming Center).
- Clicking it takes you to the correct page (e.g., `/ticket/10`).

### Troubleshooting

| Issue                        | Check                                              |
| ---------------------------- | -------------------------------------------------- |
| No popup, no sound           | Backend logs show 0 tokens → token not registered  |
| Sound but no popup           | Service worker running but OS notification blocked |
| Popup appears but wrong link | `clickAction` in push payload misconfigured        |

---

## Test Scenario 2: Background Push (Mobile)

### Setup

1. **Open browser on Android/iPhone**.
2. **Navigate** to your app and **login**.
3. **Wait for logs** (same as desktop).
4. **Lock the screen** or swipe the app away (background).

### Send a Push

- From another device/agent account, send a message to trigger notification.

### Expected Result ✓

- Native Android/iOS notification appears at the top of the screen.
- Clicking it opens your app to the correct page.

---

## Test Scenario 3: Verify Token Registration

### In Browser Console (after login)

```javascript
// Check auth token
localStorage.getItem("ict_token");

// Result should be: "eyJ0eXAi..." (long JWT token)
```

### In Render Backend Logs

- Look for: `[Notifications] 🔔 Register attempt: role=user, id=8, platform=web, tokenPrefix=...`
- If **not present**: Frontend never called registration endpoint.
- If **present**: Token was registered; check next step.

### In Render Backend Logs (message send)

- Look for: `[Messages] Agent message on #10: found N user token(s) for user 8`
- If `N=0`: Token stored but not associated with correct user.
- If `N>0`: Tokens found; check FCM logs next.

### In Render Backend Logs (Firebase delivery)

- Look for: `[FCM] Sending push to X token(s)...`
- Look for: `[FCM] ✅ Push delivery: X/X succeeded.`
- If `succeeded=0`: Firebase rejected tokens (check token format).

---

## Test Scenario 4: Foreground vs Background

### Foreground (tab open/focused)

1. **Keep Chrome open and focused**.
2. **Send a message** (same as above).
3. **Expected**: In-app toast notification (not native popup).

### Background (tab minimized/closed)

1. **Minimize Chrome** or **close all tabs** for your app.
2. **Send a message**.
3. **Expected**: Native OS popup (not in-app toast).

---

## Debugging Steps

### Step 1: Verify Permission

```javascript
// In browser console
Notification.permission;
// Should return: "granted"
```

### Step 2: Check Service Worker

1. Open DevTools → Application → Service Workers.
2. Confirm your SW is **activated and running**.
3. Check the scope (should be `/`).

### Step 3: Check Browser Notification Settings

- **Chrome Desktop**: Settings → Privacy → Site Settings → Notifications → Allow
- **Chrome Mobile**: Settings → Apps → Chrome → Permissions → Notifications
- **Windows**: Settings → System → Notifications & actions → Allow notifications from apps

### Step 4: Enable Backend Logs

- Render dashboard → Logs (real-time).
- Filter for `[Notifications]`, `[Messages]`, `[FCM]`.

### Step 5: Simulate Closed App (For Testing)

- Use DevTools → Application → Service Workers → **Unregister** temporarily to simulate app not installed.
- Then re-register by refreshing the page.
- This verifies the registration flow works.

---

## Common Issues & Fixes

### "No tokens found"

- **Cause**: User never registered a token after login.
- **Fix**: Check browser logs for `[Push] FCM token:`. If missing, token generation failed.

### "Found X tokens but 0/X succeeded"

- **Cause**: FCM rejected the tokens (expired, invalid format, etc.).
- **Fix**: Tokens may be stale. Clear browser storage (`localStorage.clear()`) and re-login to get fresh token.

### "Popup appears but on wrong page"

- **Cause**: `clickAction` in the push payload is wrong.
- **Fix**: Check [backend/routes/messages.js](../backend/routes/messages.js#L155) → `data.clickAction` value.

### "Sound plays but no popup"

- **Cause**: Service worker can't call `showNotification()` (browser/OS blocked notifications).
- **Fix**: Verify Chrome notification permission in OS settings (not just browser permission).

---

## Test Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend running on Render
- [ ] User logs in successfully
- [ ] Browser console shows `[Push] FCM token: ...`
- [ ] Browser console shows `[Push] ✅ Token registered with backend.`
- [ ] Backend Render logs show `[Notifications] 🔔 Register attempt: ...`
- [ ] Close/minimize app
- [ ] Send a test message from another account
- [ ] Native notification popup appears
- [ ] Clicking popup takes you to correct page
- [ ] Same test passes on mobile (Android/iOS)

---

## Next Steps

If native notifications **still don't appear** after this test:

1. Provide the **exact backend logs** from Render (share screenshot or paste).
2. Provide the **exact browser console logs** (screenshot or paste).
3. Specify which device/browser (desktop Chrome, iPhone Safari, Android Chrome, etc.).
4. Specify whether you see **only sound** or **nothing at all**.

We can then isolate whether the issue is:

- Token registration (frontend → backend)
- Token storage (backend → database)
- Push delivery (backend → Firebase)
- Service worker reception (Firebase → browser)
- OS notification rendering (browser → OS)
