import { Routes, Route, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [pushAvailable, setPushAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  const addNotification = useCallback(
    (message, type = "info", ticketId = null) => {
      const id = `${Date.now()}-${Math.random()}`;
      setNotifications((prev) => [...prev, { id, message, type, ticketId }]);
      setUnreadCount((value) => value + 1);
      playNotificationTone();
    },
    [],
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleNotificationClick = useCallback(
    (ticketId) => {
      if (ticketId) {
        navigate(`/ticket/${ticketId}`);
      }
    },
    [navigate],
  );

  useEffect(() => {
    if (user) {
      connectSocket();
    } else {
      socket.disconnect();
    }
  }, [user]);

  useEffect(() => {
    const handleSocketEvents = (eventKey, data) => {
      if (!user) return;

      const isTargetUser = data?.userId === user.id;
      const isTargetAgent = !data?.agentId || data.agentId === user.id;

      switch (eventKey) {
        case "new_ticket":
          if (user.role === "admin") {
            addNotification(
              `New ticket #${data.id} submitted by ${data.name}.`,
              "notification",
              null,
            );
          }
          if (user.role === "agent") {
            addNotification(
              `New ticket #${data.id} submitted. Check the queue.`,
              "notification",
              null,
            );
          }
          break;
        case "admin_notification":
          if (user.role === "admin") {
            addNotification(
              data.message || "New admin alert",
              "notification",
              data.ticketId,
            );
          }
          break;
        case "ticket_resolved":
          if (user.role === "user" && isTargetUser) {
            addNotification(
              `Your ticket "${data.problem}" has been resolved!`,
              "success",
              data.ticketId,
            );
          }
          break;
        case "user_notification":
          if (user.role === "user" && isTargetUser) {
            addNotification(
              data.message || `Ticket #${data.ticketId} updated.`,
              "message",
              data.ticketId,
            );
          }
          break;
        case "agent_notification":
          if (user.role === "agent" && isTargetAgent) {
            addNotification(
              data.message || `New activity on ticket #${data.ticketId}.`,
              "message",
              data.ticketId,
            );
          }
          break;
        default:
          break;
      }
    };

    const events = [
      "new_ticket",
      "admin_notification",
      "ticket_resolved",
      "user_notification",
      "agent_notification",
    ];

    events.forEach((event) => {
      socket.on(event, (payload) => handleSocketEvents(event, payload));
    });

    return () => {
      events.forEach((event) => socket.off(event));
    };
  }, [user, addNotification]);

  useEffect(() => {
    const initializePush = async () => {
      if (!user || !isPushSupported()) {
        setPushAvailable(false);
        return;
      }

      setPushAvailable(true);
      const permission =
        Notification.permission === "granted"
          ? "granted"
          : await requestNotificationPermission();

      if (permission === "granted") {
        await initializePushNotifications(user, user.role);
      }
    };

    initializePush();
  }, [user]);

  useEffect(() => {
    const unsubscribe = listenFirebaseMessages((payload) => {
      const ticketId = payload?.data?.ticketId
        ? Number(payload.data.ticketId)
        : null;
      const title = payload.notification?.title || "Help Desk Notification";
      const body = payload.notification?.body || "You have a new notification.";
      addNotification(`${title}: ${body}`, "notification", ticketId);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [addNotification]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleFocus = () => setUnreadCount(0);
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const statusMessage = useMemo(() => {
    if (!isOnline) return "Offline: live socket notifications are paused.";
    if (!pushAvailable)
      return "Push notifications not available for this browser.";
    return "Live socket and push notifications are enabled.";
  }, [isOnline, pushAvailable]);

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

      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            position: "fixed",
            top: `${20 + index * 80}px`,
            right: "20px",
            zIndex: 1000,
          }}
        >
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
            onClick={() => handleNotificationClick(notification.ticketId)}
          />
        </div>
      ))}
    </div>
  );
}
