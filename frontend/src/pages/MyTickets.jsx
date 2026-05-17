import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTickets } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import {
  ClipboardList,
  Building,
  MapPin,
  User,
  Clock,
  Inbox,
  Loader2,
} from "lucide-react";

export default function MyTickets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, colors } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | open | resolved

  useEffect(() => {
    if (!user || user.role !== "user") {
      navigate("/user/login");
      return;
    }
    loadTickets();
  }, [user]);

  const loadTickets = async () => {
    try {
      const res = await getMyTickets();
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on("new_ticket", (ticket) => {
      setTickets((prev) => [ticket, ...prev]);
    });
    socket.on("ticket_updated", (updated) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
    });

    return () => {
      socket.off("new_ticket");
      socket.off("ticket_updated");
    };
  }, []);

  const filtered =
    filter === "all"
      ? tickets
      : filter === "open"
        ? tickets.filter((t) => t.status !== "resolved")
        : tickets.filter((t) => t.status === "resolved");

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "clamp(40px, 10vw, 80px) clamp(16px, 3vw, 20px)",
          color: colors.textSecondary,
          background: isDark ? colors.bg : "#f8fafc",
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.3s ease",
        }}
      >
        <div style={{ marginBottom: 16, animation: "spin 2s linear infinite" }}>
          <Loader2
            size="clamp(32px, 6vw, 48px)"
            color={colors.textSecondary}
            strokeWidth={1.5}
          />
        </div>
        <p
          style={{
            fontWeight: 600,
            color: colors.text,
            fontSize: "clamp(14px, 2vw, 16px)",
          }}
        >
          Loading tickets...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "clamp(16px, 4vw, 32px)",
        background: isDark ? colors.bg : "#f8fafc",
        minHeight: "90vh",
        transition: "background-color 0.3s ease",
      }}
    >
      <img src="/IT (2).jpg" alt="IT Support" style={{ display: "none" }} />
      {/* Header */}
      <div style={{ marginBottom: "clamp(16px, 3vw, 28px)" }}>
        <h1
          style={{
            fontSize: "clamp(20px, 5vw, 28px)",
            fontWeight: 700,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: "clamp(8px, 2vw, 12px)",
            color: colors.text,
            flexWrap: "wrap",
          }}
        >
          <ClipboardList
            size="clamp(20px, 5vw, 28px)"
            color="#667eea"
            strokeWidth={1.5}
          />
          Your Tickets
        </h1>
        <p
          style={{
            color: colors.textSecondary,
            fontSize: "clamp(13px, 2vw, 14px)",
          }}
        >
          Track the status of all your support requests
        </p>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "clamp(6px, 2vw, 8px)",
          marginBottom: "clamp(16px, 2vw, 24px)",
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "all", label: "All Tickets" },
          { key: "open", label: "Open" },
          { key: "resolved", label: "Resolved" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 2vw, 16px)",
              borderRadius: "clamp(8px, 1.5vw, 12px)",
              fontSize: "clamp(12px, 2vw, 14px)",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              border: `1.5px solid ${
                filter === tab.key ? "#667eea" : colors.border
              }`,
              background:
                filter === tab.key
                  ? "#667eea"
                  : isDark
                    ? colors.bgSecondary
                    : "#fff",
              color: filter === tab.key ? "#fff" : colors.textSecondary,
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets list */}
      {filtered.length === 0 ? (
        <div
          style={{
            borderRadius: 16,
            padding: 64,
            textAlign: "center",
            background: isDark ? colors.bgSecondary : "#f8fafc",
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ color: colors.textSecondary, marginBottom: 16 }}>
            <Inbox size={48} style={{ margin: "0 auto" }} />
          </div>
          <p
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: colors.text,
              marginBottom: 8,
            }}
          >
            No tickets yet
          </p>
          <p style={{ fontSize: 14, color: colors.textSecondary }}>
            All your issues have been resolved!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((ticket) => {
            const hours = Math.floor(
              (Date.now() - new Date(ticket.createdAt)) / 3600000,
            );
            const timeAgo = hours > 0 ? `${hours}h ago` : "now";

            return (
              <div
                key={ticket.id}
                onClick={() => navigate(`/ticket/${ticket.id}`)}
                style={{
                  borderRadius: 12,
                  padding: 16,
                  borderLeft: `4px solid ${
                    ticket.priority === "high"
                      ? "#ef4444"
                      : ticket.priority === "medium"
                        ? "#f59e0b"
                        : "#10b981"
                  }`,
                  background: isDark ? colors.bgSecondary : "#fff",
                  border: `1px solid ${colors.border}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 10px 15px rgba(0,0,0,0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(0,0,0,0.05)")
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", gap: 8 }}>
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      fontWeight: 500,
                    }}
                  >
                    #{ticket.id}
                  </span>
                </div>

                <p
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 12,
                    color: colors.text,
                  }}
                >
                  {ticket.problem.substring(0, 70)}
                  {ticket.problem.length > 70 ? "..." : ""}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    fontSize: 13,
                    color: colors.textSecondary,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Building size={14} />
                    {ticket.department}
                  </span>
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <MapPin size={14} />
                    {ticket.location}
                  </span>
                  {ticket.agent && (
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <User size={14} />
                      {ticket.agent.name}
                    </span>
                  )}
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginLeft: "auto",
                    }}
                  >
                    <Clock size={14} />
                    {timeAgo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
