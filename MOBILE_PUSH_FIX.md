# Mobile Push Notifications — Quick Fix Guide

## ✅ What was fixed:

1. **Enhanced service worker** with Android-specific notification options
   - Vibration patterns
   - Sound support
   - Action buttons (Open/Dismiss)
   - Proper data handling for mobile

2. **Better mobile detection** on frontend
   - Logs detected platform (mobile-web vs web)
   - Explicit user agent logging for debugging

3. **Mobile diagnostics script** (see MOBILE_PUSH_DEBUG.js)
   - Detects Android vs iOS
   - Identifies browser support
   - Suggests OS-specific fixes

---

## 🔧 How to Test on Mobile

### **Android Chrome (RECOMMENDED)**

1. **Open Chrome** on your Android phone
2. **Navigate to** https://ict-unit-help-desk.vercel.app
3. **Login** (any user/agent/admin)
4. **Open DevTools Console** (Chrome: ⋮ → More tools → Developer tools)
5. **Paste and run:**

   ```javascript
   // Paste MOBILE_PUSH_DEBUG.js code here
   // Then run:
   enableNotificationsOnMobile();
   ```

6. **Check the console output:**
   - ✓ Device detected: Android
   - ✓ Notification permission: granted
   - ✓ Service Worker: Active

7. **Close or minimize Chrome** (important: must go to background)
8. **From another device/account, send a test message**
9. **Look for native Android notification** (will appear at top of screen)

### **iPhone/iPad Safari**

⚠️ **Warning:** iOS Safari has **limited push notification support**

**Better option:** Use PWA (Progressive Web App)

1. Open your app in Safari
2. Tap **Share** → **Add to Home Screen**
3. Open app from home screen (not Safari)
4. This activates PWA mode with better push support

---

## ❌ If notifications STILL don't appear:

### **Step 1: Check Android OS Settings**

On your Android phone:

1. **Settings** → **Apps** (or Application Manager)
2. Find **Chrome**
3. Tap **Notifications** or **Permissions**
4. Make sure **Notifications** is **ON** ✓

### **Step 2: Verify Browser Registration**

In Chrome console, run:

```javascript
// Check if service worker is active
navigator.serviceWorker
  .getRegistration("/firebase-messaging-sw.js")
  .then((r) => {
    console.log("SW active:", r.active ? "YES ✓" : "NO ✗");
  });

// Check notification permission
console.log("Permission:", Notification.permission);
```

**Expected output:**

- `SW active: YES ✓`
- `Permission: granted`

### **Step 3: Check Backend Token Registration**

In Chrome console, run:

```javascript
// Import the test function and check tokens
const token = localStorage.getItem("ict_token");
fetch("https://ict-unit-help-desk.onrender.com/api/test/tokens", {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((r) => r.json())
  .then((data) => {
    console.log(
      "Your tokens:",
      data.tokens.filter((t) =>
        t.role === localStorage.getItem("ict_user")
          ? JSON.parse(localStorage.getItem("ict_user")).role
          : "",
      ),
    );
  });
```

**If no tokens appear:**

- User was never registered
- Try logging out and back in
- Check browser console for `[Push] FCM token:` log

### **Step 4: Send Test Notification**

In Chrome console, run:

```javascript
// Paste PUSH_TEST_CONSOLE.js code here
// Then send a test:
sendTestNotification(8); // Replace 8 with your user ID
```

**Then minimize the app** and check:

- Backend Render logs should show `[FCM] Sending push to 1 token(s)...`
- If that succeeds but no popup → OS notification blocked

### **Step 5: Check Render Backend Logs**

In Render dashboard:

1. Go to your backend service
2. **Logs** tab (real-time)
3. Look for:
   ```
   [TEST] Found X token(s) for user 8
   [FCM] Sending push to X token(s)...
   [FCM] ✅ Push delivery: X/X succeeded
   ```

---

## 📋 Common Mobile Issues & Fixes

| Issue                                | Cause                                      | Fix                                                               |
| ------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------- |
| **No notification, no sound**        | Token not registered                       | Check browser logs for `[Push] FCM token:`. Refresh and re-login. |
| **Sound plays but no popup**         | OS notification permission blocked         | Check Android Settings → Apps → Chrome → Notifications            |
| **Service worker not active**        | SW failed to install on mobile             | Refresh page, clear cache, reinstall.                             |
| **Token registered but 0 succeeded** | Firebase rejected token (stale/invalid)    | Log out, clear localStorage, log back in to get fresh token.      |
| **Works on desktop but not mobile**  | Different browser or mobile-specific issue | Try Chrome on Android; Safari on iOS has limited support.         |

---

## 🆘 If Still Stuck

**Please provide:**

1. **Mobile phone OS** (Android 12, Android 13, iOS 16, etc.)
2. **Browser** (Chrome, Firefox, Samsung Internet, Safari, etc.)
3. **Screenshot of Chrome DevTools console** showing:

   ```
   Device detected: Android
   Platform type: mobile-web
   [Push] FCM token: [prefix]…
   ```

4. **Backend Render logs** showing token lookup:
   ```
   [TEST] Found X token(s) for user Y
   [FCM] Sending push to...
   ```

With this info, I can pinpoint the exact issue!

---

## ✅ Checklist for Mobile Testing

- [ ] Backend deployed with test endpoint
- [ ] Frontend deployed with Android options
- [ ] Using Android Chrome (recommended)
- [ ] Logged in successfully
- [ ] Browser console shows `[Push] FCM token:`
- [ ] Android Settings allow Chrome notifications
- [ ] Service Worker shows "Active" in Chrome DevTools
- [ ] Close/minimize the app
- [ ] Send test notification
- [ ] Native Android popup appears at top of screen
- [ ] Clicking popup opens correct page
