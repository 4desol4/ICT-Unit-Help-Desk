import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import socket from "./socket";
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

export default function App() {
  const { user } = useAuth();
  const { isDark, colors } = useTheme();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Ticket created notifications for admin and agent
    socket.on("new_ticket", (ticket) => {
      if (user?.role === "admin") {
        addNotification(
          `New ticket #${ticket.id} submitted by ${ticket.name}.`,
          "notification",
        );
      }

      if (user?.role === "agent") {
        addNotification(
          `New ticket #${ticket.id} submitted. Check the queue.`,
          "notification",
        );
      }
    });

    socket.on("admin_notification", (data) => {
      if (user?.role === "admin") {
        addNotification(data.message || "New admin alert", "notification");
      }
    });

    socket.on("ticket_resolved", (data) => {
      if (user?.role === "user" && user.id === data.userId) {
        addNotification(
          `Your ticket "${data.problem}" has been resolved!`,
          "success",
        );
      }
    });

    socket.on("user_notification", (data) => {
      if (user?.role === "user" && user.id === data.userId) {
        addNotification(
          data.message || `Ticket #${data.ticketId} updated.`,
          "message",
        );
      }
    });

    socket.on("agent_notification", (data) => {
      if (
        user?.role === "agent" &&
        (!data.agentId || data.agentId === user.id)
      ) {
        addNotification(
          data.message || `New activity on ticket #${data.ticketId}.`,
          "message",
        );
      }
    });

    return () => {
      socket.off("new_ticket");
      socket.off("admin_notification");
      socket.off("ticket_resolved");
      socket.off("user_notification");
      socket.off("agent_notification");
    };
  }, [user]);

  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

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
      <Navbar />
      <main>
        <Routes>
          {/* Staff routes */}
          <Route path="/" element={<SubmitTicket />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/ticket/:ticketId" element={<UserTicketChat />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPanel />} />

          {/* Agent routes */}
          <Route path="/agent/login" element={<AgentLogin />} />
          <Route path="/agent" element={<AgentDashboard />} />

          {/* User routes */}
          <Route path="/user/login" element={<UserLogin />} />
        </Routes>
      </main>

      {/* Notifications */}
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
          />
        </div>
      ))}
    </div>
  );
}
