import { Routes, Route, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import socket, { connectSocket } from "./socket";
import Navbar from "./components/Navbar";
import Notification from "./components/Notification";
import SubmitTicket from "./pages/SubmitTicket";
import MyTickets from "./pages/MyTickets";
import UserTicketChat from "./pages/UserTicketChat";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AgentLogin from "./pages/AgentLogin";
import AgentDashboard from "./pages/AgentDashboard";
import UserLogin from "./pages/UserLogin";
import { Bell } from "lucide-react";
import {
  initializePushNotifications,
  listenFirebaseMessages,
  playNotificationTone,
  requestNotificationPermission,
  isPushSupported,
} from "./notificationService";

export default function App() {
  const { user } = useAuth();
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPermission, setNotifPermission] = useState(
    isPushSupported() ? Notification.permission : "unsupported",
  );
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  // Keep a ref to user so socket handlers always see current user
  // without needing to re-register events on every render
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ── Add an in-app toast ────────────────────────────────────────────────────
  const addNotification = useCallback(
    (message, type = "info", ticketId = null, targetPath = null) => {
      const id = `${Date.now()}-${Math.random()}`;
      console.log("[Toast] 🍞 Adding notification to state:", {
        id,
        message,
        type,
        ticketId,
        targetPath,
      });
      setNotifications((prev) => {
        const updated = [...prev, { id, message, type, ticketId, targetPath }];
        console.log(
          "[Toast] 📊 Notifications state updated. Count:",
          updated.length,
        );
        return updated;
      });
      setUnreadCount((v) => v + 1);
      playNotificationTone();
    },
    [],
  );

  const removeNotification = useCallback((id) => {
    console.log("[Toast] ✂️  Removing notification:", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleNotificationClick = useCallback(
    (ticketId, targetPath = null) => {
      let resolvedPath = targetPath;

      if (!resolvedPath) {
        if (user?.role === "agent") {
          resolvedPath = ticketId ? `/agent?ticketId=${ticketId}` : "/agent";
        } else if (user?.role === "admin") {
          resolvedPath = ticketId ? `/admin?ticketId=${ticketId}` : "/admin";
        } else if (ticketId) {
          resolvedPath = `/ticket/${ticketId}`;
        }
      }

      console.log(
        "[Toast] 👆 Notification clicked. Navigating to:",
        resolvedPath,
      );
      if (resolvedPath) navigate(resolvedPath);
    },
    [navigate, user?.role],
  );

  // ── Connect / disconnect socket when user logs in or out ──────────────────
  useEffect(() => {
    if (user) {
      connectSocket();
    } else {
      socket.disconnect();
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // ── Register ALL socket event listeners ONCE on mount ────────────────────
  // We use userRef so the handlers always read the current user without
  // needing to be re-registered every time `user` changes.
  useEffect(() => {
    // new_ticket — broadcast to everyone; we filter by role inside
    const onNewTicket = (data) => {
      const u = userRef.current;
      if (!u) return;
      if (u.role === "admin") {
        addNotification(
          `🎫 New ticket #${data.id} from ${data.name} — ${data.department}`,
          "notification",
          data.id,
          "/admin",
        );
      }
      if (u.role === "agent") {
        addNotification(
          `🎫 New ticket #${data.id} arrived in the queue.`,
          "notification",
          data.id,
          "/agent",
        );
      }
    };

    // admin_notification — sent to "admins" room only
    const onAdminNotification = (data) => {
      const u = userRef.current;
      if (!u || u.role !== "admin") return;
      addNotification(
        data.message || "New admin notification",
        "notification",
        data.ticketId || null,
        "/admin",
      );
    };

    // agent_notification — sent to "agents" room or `agent_<id>` room
    const onAgentNotification = (data) => {
      const u = userRef.current;
      if (!u || u.role !== "agent") return;
      // If agentId is specified only show to that agent; otherwise show to all agents
      if (data.agentId && data.agentId !== u.id) return;
      addNotification(
        data.message || `New activity on ticket #${data.ticketId}`,
        "message",
        data.ticketId || null,
        "/agent",
      );
    };

    // ticket_resolved — tells the user their ticket is done
    const onTicketResolved = (data) => {
      const u = userRef.current;
      if (!u || u.role !== "user") return;
      if (data.userId !== u.id) return;
      addNotification(
        `✅ Your ticket has been resolved by ${data.agentName || "support"}.`,
        "success",
        data.ticketId,
        data.ticketId ? `/ticket/${data.ticketId}` : null,
      );
    };

    // user_notification — status updates sent to `user_<id>` room
    const onUserNotification = (data) => {
      const u = userRef.current;
      if (!u || u.role !== "user") return;
      if (data.userId !== u.id) return;
      addNotification(
        data.message || `Ticket #${data.ticketId} was updated.`,
        "message",
        data.ticketId || null,
        data.ticketId ? `/ticket/${data.ticketId}` : null,
      );
    };

    // ticket_updated — keep UI in sync (no toast needed — silent update)
    // ticket_deleted — also handled silently inside AdminPanel / AgentDashboard

    socket.on("new_ticket", onNewTicket);
    socket.on("admin_notification", onAdminNotification);
    socket.on("agent_notification", onAgentNotification);
    socket.on("ticket_resolved", onTicketResolved);
    socket.on("user_notification", onUserNotification);

    return () => {
      socket.off("new_ticket", onNewTicket);
      socket.off("admin_notification", onAdminNotification);
      socket.off("agent_notification", onAgentNotification);
      socket.off("ticket_resolved", onTicketResolved);
      socket.off("user_notification", onUserNotification);
    };
    // addNotification is stable (useCallback with no deps) so this runs once
  }, [addNotification]);

  // ── Firebase push: auto-request & register on login ────────────────────
  useEffect(() => {
    if (!user || !isPushSupported()) return;

    (async () => {
      const current = Notification.permission;

      // Already granted — register immediately
      if (current === "granted") {
        setNotifPermission("granted");
        await initializePushNotifications().catch(console.warn);
      }
      // Not yet asked — request silently (no blocking UI)
      else if (current === "default") {
        try {
          const result = await Notification.requestPermission();
          setNotifPermission(result);
          if (result === "granted") {
            await initializePushNotifications().catch(console.warn);
          }
        } catch (err) {
          console.warn("[Push] Auto-request failed:", err.message);
        }
      }
      // Denied — user must manually enable in browser settings
      else {
        setNotifPermission("denied");
      }
    })();
  }, [user]);

  // ── Firebase push: foreground messages → in-app toast ────────────────────
  useEffect(() => {
    console.log("[Toast] Setting up Firebase foreground listener...");

    const unsubscribe = listenFirebaseMessages((payload) => {
      console.log("[Toast] 🔥 Firebase foreground payload received:", payload);

      const ticketId = payload?.data?.ticketId
        ? Number(payload.data.ticketId)
        : null;
      const targetPath =
        payload?.data?.clickAction || payload?.data?.click_action || null;
      const title = payload.notification?.title || "Help Desk";
      const body = payload.notification?.body || "You have a new notification.";

      console.log("[Toast] Extracted:", { ticketId, targetPath, title, body });

      addNotification(
        `${title}: ${body}`,
        "notification",
        ticketId,
        targetPath,
      );
    });

    return () => {
      console.log("[Toast] Cleaning up Firebase foreground listener...");
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [addNotification]);

  // ── Online / offline ───────────────────────────────────────────────────────
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // ── Clear badge when tab is focused ───────────────────────────────────────
  useEffect(() => {
    const onFocus = () => setUnreadCount(0);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // ── Handle notification click from service worker ────────────────────────
  // When user clicks a notification while app is open, service worker sends
  // a postMessage. We handle that here to navigate properly.
  useEffect(() => {
    const handleServiceWorkerMessage = (event) => {
      console.log("[SW Message] Received from service worker:", event.data);

      if (event.data?.type === "NOTIFICATION_CLICK") {
        const { targetUrl, clickAction } = event.data;
        console.log("[SW Message] Handling notification click to:", targetUrl);

        // Navigate to the target URL
        if (targetUrl) {
          // If it's a query param URL like /agent?ticketId=10, navigate will trigger
          // the AgentDashboard useEffect to detect and open the modal
          navigate(targetUrl);
        }
      }
    };

    navigator.serviceWorker?.addEventListener(
      "message",
      handleServiceWorkerMessage,
    );

    return () => {
      navigator.serviceWorker?.removeEventListener(
        "message",
        handleServiceWorkerMessage,
      );
    };
  }, [navigate]);

  // ── "Enable Notifications" button ─────────────────────────────────────────
  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotifPermission(permission);
    if (permission === "granted") {
      await initializePushNotifications();
    }
  };

  const statusMessage = isOnline
    ? notifPermission === "granted"
      ? "Socket & push notifications active."
      : "Socket notifications active. Push not enabled."
    : "Offline — live notifications paused.";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: isDark ? "#000000" : "#f8fafc",
        color: colors.text,
        transition: "background-color 0.3s ease",
        backgroundImage: isDark
          ? "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.03) 1px, transparent 1px)"
          : "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.04) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }}
    >
      <Navbar
        notificationCount={unreadCount}
        notificationStatus={statusMessage}
      />

      {/* Enable push notifications banner — only shown when logged in + not granted */}
      {user && isPushSupported() && notifPermission === "default" && (
        <div
          style={{
            background: isDark
              ? "rgba(99,102,241,0.12)"
              : "rgba(99,102,241,0.07)",
            borderBottom: `1px solid ${isDark ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.18)"}`,
            padding: "10px clamp(16px,3vw,28px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: isDark ? "#a5b4fc" : "#4338ca",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Bell size={16} />
            Enable push notifications to get alerts even when this tab is
            closed.
          </div>
          <button
            onClick={handleEnableNotifications}
            style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "9px 20px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}
          >
            Enable Notifications
          </button>
        </div>
      )}

      <main>
        <Routes>
          <Route path="/" element={<SubmitTicket />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/ticket/:ticketId" element={<UserTicketChat />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/agent/login" element={<AgentLogin />} />
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/user/login" element={<UserLogin />} />
        </Routes>
      </main>

      {/* Toast stack */}
      {notifications.map((n, index) => (
        <div
          key={n.id}
          style={{
            position: "fixed",
            top: `${20 + index * 84}px`,
            right: "20px",
            zIndex: 9999,
            transition: "top 0.25s ease",
          }}
        >
          <Notification
            message={n.message}
            type={n.type}
            onClose={() => removeNotification(n.id)}
            onClick={() => handleNotificationClick(n.ticketId, n.targetPath)}
          />
        </div>
      ))}
    </div>
  );
}
