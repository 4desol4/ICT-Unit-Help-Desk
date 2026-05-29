import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  getTickets,
  updateTicket,
  getMessages,
  getAgentStats,
  sendAgentMessage,
} from "../api";
import socket from "../socket";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";

import {
  AlertCircle,
  Clipboard,
  Zap,
  CheckCircle,
  Loader2,
  MessageCircle,
  Save,
  Send,
  User,
  Building2,
  Bell,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  X,
} from "lucide-react";

// ─────────────────────────────────────────────
// Dashboard Stats
// ─────────────────────────────────────────────
function DashboardStats({ tickets, agentStats }) {
  const { isDark, colors } = useTheme();

  const stats = {
    unassigned: tickets.filter((t) => !t.agentId).length,
    myTickets: tickets.filter((t) => t.agentId).length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  const statCards = [
    {
      icon: AlertCircle,
      label: "Unassigned",
      value: stats.unassigned,
      gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
    },
    {
      icon: Clipboard,
      label: "My Tickets",
      value: stats.myTickets,
      gradient: "linear-gradient(135deg,#6366f1,#4f46e5)",
    },
    {
      icon: Zap,
      label: "In Progress",
      value: stats.inProgress,
      gradient: "linear-gradient(135deg,#f97316,#ea580c)",
    },
    {
      icon: CheckCircle,
      label: "Resolved",
      value: stats.resolved,
      gradient: "linear-gradient(135deg,#10b981,#059669)",
    },
    {
      icon: ShieldCheck,
      label: "My Resolved",
      value: agentStats?.resolvedCount || 0,
      gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
        gap: 16,
        marginBottom: 28,
      }}
    >
      {statCards.map((stat, idx) => (
        <div
          key={idx}
          className="fade-up"
          style={{
            padding: 20,
            borderRadius: 24,
            background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
            border: `1px solid ${
              isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"
            }`,
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 16,
              background: stat.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              boxShadow: "0 14px 24px rgba(0,0,0,0.2)",
            }}
          >
            <stat.icon size={22} color="#fff" />
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: colors.text,
            }}
          >
            {stat.value}
          </div>

          <div
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              fontWeight: 600,
            }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function AgentTicketCard({ ticket, onSelect }) {
  const { isDark, colors } = useTheme();

  const hours = Math.floor((Date.now() - new Date(ticket.createdAt)) / 3600000);
  const timeAgo = hours > 0 ? `${hours}h ago` : "now";

  return (
    <div
      onClick={() => onSelect(ticket)}
      className="ticket-card"
      style={{
        padding: 22,
        borderRadius: 26,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "0.3s ease",
        background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
      }}
    >
      {/* left indicator */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background:
            ticket.priority === "high"
              ? "#ef4444"
              : ticket.priority === "medium"
                ? "#f59e0b"
                : "#10b981",
        }}
      />

      {/* top */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>

        <span
          style={{
            fontSize: 12,
            color: colors.textSecondary,
            fontWeight: 700,
          }}
        >
          #{ticket.id}
        </span>
      </div>

      {/* problem */}
      <p
        style={{
          color: colors.text,
          fontSize: 16,
          lineHeight: 1.7,
          fontWeight: 700,
          marginBottom: 18,
        }}
      >
        {ticket.problem.substring(0, 120)}
        {ticket.problem.length > 120 ? "..." : ""}
      </p>

      {/* footer */}
      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: colors.textSecondary,
            fontSize: 13,
          }}
        >
          <User size={15} />
          {ticket.name}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: colors.textSecondary,
            fontSize: 13,
          }}
        >
          <Building2 size={15} />
          {ticket.department}
        </div>

        <div
          style={{
            marginLeft: "auto",
            color: colors.text,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {timeAgo}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Modal — FIXED: real-time messages via socket
// ─────────────────────────────────────────────
function TicketDetailModal({ ticket, agentId, onClose, onUpdate }) {
  const { isDark, colors } = useTheme();

  const [status, setStatus] = useState(ticket.status);
  const [notes, setNotes] = useState(ticket.resolution || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);

  // Ref to scroll to bottom on new message
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadMessages();
  }, [ticket.id]);

  // FIX: Subscribe to real-time socket messages for this ticket.
  // Without this the agent had to close and reopen the modal to see new messages.
  useEffect(() => {
    const handleNewMessage = ({ ticketId: tid, message }) => {
      if (Number(tid) !== Number(ticket.id)) return;

      setMessages((prev) => {
        // Guard against duplicates (message may already be in state from the
        // sendAgentMessage API call response that returns immediately).
        if (!message || !message.id) return [...prev, message];
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      setTimeout(() => scrollToBottom(), 80);
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [ticket.id]);

  const loadMessages = async () => {
    try {
      const res = await getMessages(ticket.id);
      setMessages(res.data);
      setTimeout(() => scrollToBottom(), 80);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const res = await updateTicket(ticket.id, {
        status,
        agentId: ticket.agentId || agentId,
        resolution: status === "resolved" ? notes : ticket.resolution,
      });

      onUpdate(res.data);
      setSaved(true);
      setTimeout(() => onClose(), 900);
    } catch (err) {
      alert("Failed to update ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMsg.trim() || loadingMsg) return;

    const text = newMsg;
    setNewMsg("");
    setLoadingMsg(true);

    try {
      const res = await sendAgentMessage(ticket.id, { text });

      // Optimistically add the message — the socket broadcast will be ignored
      // by the duplicate guard above if it arrives before the state update.
      const message = res?.data;
      if (message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        setTimeout(() => scrollToBottom(), 80);
      }
    } catch (err) {
      alert("Failed to send message");
      setNewMsg(text); // restore on error
    } finally {
      setLoadingMsg(false);
    }
  };

  const date = new Date(ticket.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 32,
          background: isDark
            ? "linear-gradient(145deg,rgba(15,23,42,0.98),rgba(30,41,59,0.96))"
            : "#ffffff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
          boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
        }}
      >
        {/* header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ color: colors.text, fontWeight: 800, fontSize: 20 }}>
              Ticket #{ticket.id}
            </h2>
            <p
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                marginTop: 2,
              }}
            >
              {date} · {ticket.department} · {ticket.location}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "none",
              background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
              color: colors.text,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* body — two-column grid */}
        <div
          className="modal-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            padding: 24,
          }}
        >
          {/* left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* badges */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>

            {/* problem */}
            <div
              style={{
                background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                borderRadius: 18,
                padding: 18,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
              }}
            >
              <p
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 10,
                }}
              >
                Problem
              </p>
              <p style={{ color: colors.text, lineHeight: 1.7, fontSize: 14 }}>
                {ticket.problem}
              </p>
            </div>

            {/* reporter */}
            <div
              style={{
                background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                borderRadius: 18,
                padding: 18,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
              }}
            >
              <p
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 10,
                }}
              >
                Reporter
              </p>
              <p style={{ color: colors.text, fontSize: 14 }}>{ticket.name}</p>
            </div>

            {/* status selector */}
            <div>
              <p
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 10,
                }}
              >
                Update Status
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["open", "in_progress", "resolved"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 14,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 13,
                      background:
                        status === s
                          ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                          : isDark
                            ? "rgba(255,255,255,0.05)"
                            : "#f1f5f9",
                      color: status === s ? "#fff" : colors.textSecondary,
                    }}
                  >
                    {s === "in_progress"
                      ? "In Progress"
                      : s === "resolved"
                        ? "Resolved"
                        : "Open"}
                  </button>
                ))}
              </div>
            </div>

            {/* resolution notes */}
            {status === "resolved" && (
              <div>
                <p
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 10,
                  }}
                >
                  Resolution Notes
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe how the issue was resolved..."
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                    background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                    color: colors.text,
                    fontSize: 13,
                    resize: "vertical",
                    outline: "none",
                    lineHeight: 1.6,
                  }}
                />
              </div>
            )}
          </div>

          {/* right — chat panel */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <MessageCircle size={18} color={colors.text} />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>
                Messages
              </h3>
            </div>

            {/* message list */}
            <div
              style={{
                flex: 1,
                minHeight: 280,
                maxHeight: 420,
                overflowY: "auto",
                padding: 16,
                borderRadius: 20,
                marginBottom: 16,
                background: isDark ? "rgba(0,0,0,0.2)" : "#f8fafc",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0"}`,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: colors.textSecondary,
                  }}
                >
                  No messages yet
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={msg.id || i}
                    style={{
                      display: "flex",
                      justifyContent:
                        msg.sender === "agent" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "85%",
                        padding: "12px 14px",
                        borderRadius: 16,
                        fontSize: 13,
                        lineHeight: 1.5,
                        background:
                          msg.sender === "agent"
                            ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                            : isDark
                              ? "rgba(255,255,255,0.08)"
                              : "#e2e8f0",
                        color: msg.sender === "agent" ? "#fff" : colors.text,
                      }}
                    >
                      {msg.sender !== "agent" && (
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            marginBottom: 4,
                            opacity: 0.7,
                          }}
                        >
                          {msg.senderName || "User"}
                        </div>
                      )}
                      {msg.text}
                      <div
                        style={{
                          fontSize: 10,
                          marginTop: 6,
                          opacity: 0.6,
                          textAlign: "right",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {/* auto-scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* input */}
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={loadingMsg}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: 16,
                  outline: "none",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                  background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                  color: colors.text,
                  fontSize: 13,
                }}
              />

              <button
                onClick={handleSendMessage}
                disabled={loadingMsg || !newMsg.trim()}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  border: "none",
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: loadingMsg || !newMsg.trim() ? 0.6 : 1,
                }}
              >
                {loadingMsg ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            padding: 20,
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0"}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "12px 22px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
              color: colors.text,
              fontWeight: 700,
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading || saved}
            style={{
              padding: "12px 24px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              background: saved
                ? "#10b981"
                : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <Loader2 size={18} className="spin" />
            ) : saved ? (
              <CheckCircle2 size={18} />
            ) : (
              <Save size={18} />
            )}
            {saved ? "Updated!" : loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AgentDashboard() {
  const { user } = useAuth();
  const { isDark, colors } = useTheme();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelected] = useState(null);
  const [filter, setFilter] = useState("unassigned");
  const [newAlert, setNewAlert] = useState(false);
  const [agentStats, setAgentStats] = useState({ resolvedCount: 0 });

  useEffect(() => {
    if (!user || user.role !== "agent") {
      navigate("/agent/login");
    }
  }, [user, navigate]);

  const loadTickets = useCallback(async () => {
    try {
      const res = await getTickets();
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAgentStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await getAgentStats(user.id);
      setAgentStats({
        resolvedCount: res.data.resolvedCount ?? res.data.resolved ?? 0,
      });
    } catch (err) {
      console.error(err);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTickets();
    loadAgentStats();
  }, [loadTickets, loadAgentStats]);

  // ── Handle ticketId query parameter (from notification click) ──────────
  useEffect(() => {
    const ticketId = searchParams.get("ticketId");
    if (ticketId && tickets.length > 0) {
      const ticket = tickets.find((t) => t.id === Number(ticketId));
      if (ticket) {
        console.log(
          "[AgentDashboard] Opening ticket from notification:",
          ticketId,
        );
        setSelected(ticket);
        // Clean up URL
        navigate("/agent", { replace: true });
      }
    }
  }, [searchParams, tickets, navigate]);

  // ── Socket listeners for real-time updates ───────────────────────────────
  useEffect(() => {
    if (!socket.connected) {
      console.warn(
        "[AgentDashboard] Socket not connected yet. Listeners may not work immediately.",
      );
    } else {
      console.log(
        "[AgentDashboard] Socket connected. Setting up real-time listeners.",
      );
    }

    // Handle new tickets
    const handleNewTicket = (t) => {
      console.log("[AgentDashboard] 🎫 New ticket received via socket:", t);
      setTickets((prev) => {
        const exists = prev.some((ticket) => ticket.id === t.id);
        if (exists) {
          console.log(
            "[AgentDashboard] Ticket already in list, updating instead",
          );
          return prev.map((ticket) => (ticket.id === t.id ? t : ticket));
        }
        console.log("[AgentDashboard] Adding new ticket to list");
        return [t, ...prev];
      });
      setNewAlert(true);
      setTimeout(() => setNewAlert(false), 5000);
    };

    // Handle ticket updates
    const handleTicketUpdated = (u) => {
      console.log("[AgentDashboard] 🔄 Ticket updated via socket:", u);
      setTickets((prev) => prev.map((t) => (t.id === u.id ? u : t)));
      // Keep the modal in sync if the updated ticket is currently open
      setSelected((prev) => (prev && prev.id === u.id ? u : prev));
    };

    // Handle new messages (for dashboard toast)
    const handleNewMessage = ({ ticketId: tid, message }) => {
      console.log(
        "[AgentDashboard] 💬 New message received on ticket",
        tid,
        ":",
        message,
      );
      // Update ticket timestamp to bubble it up in list
      setTickets((prev) =>
        prev.map((t) =>
          t.id === tid ? { ...t, updatedAt: new Date().toISOString() } : t,
        ),
      );
    };

    socket.on("new_ticket", handleNewTicket);
    socket.on("ticket_updated", handleTicketUpdated);
    socket.on("new_message", handleNewMessage);

    return () => {
      console.log("[AgentDashboard] Cleaning up socket listeners");
      socket.off("new_ticket", handleNewTicket);
      socket.off("ticket_updated", handleTicketUpdated);
      socket.off("new_message", handleNewMessage);
    };
  }, []);

  const filtered =
    filter === "unassigned"
      ? tickets.filter((t) => !t.agentId && t.status !== "resolved")
      : filter === "my"
        ? tickets.filter((t) => t.agentId === user?.id)
        : tickets;

  return (
    <div
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
        background: isDark
          ? `
            radial-gradient(circle at top right, rgba(99,102,241,0.15), transparent 30%),
            #020617
          `
          : "#f8fafc",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          position: "relative",
          minHeight: 320,
          overflow: "hidden",
          marginBottom: -50,
        }}
      >
        <img
          src="/IT (5).jpg"
          alt="Support"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.35)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(2,6,23,0.65), rgba(79,70,229,0.3))",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1200,
            margin: "0 auto",
            padding: "90px 20px 120px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 22,
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={34} color="#fff" />
            </div>

            <div>
              <h1
                style={{
                  fontSize: "clamp(2rem,5vw,3.4rem)",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.1,
                  letterSpacing: "-0.04em",
                }}
              >
                Welcome back,{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg,#ddd6fe,#fff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {user?.name}
                </span>
              </h1>

              <p
                style={{
                  color: "rgba(255,255,255,0.8)",
                  marginTop: 10,
                  fontSize: 15,
                }}
              >
                Agent Support Command Center
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 16px 80px",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* alert */}
        {newAlert && (
          <div
            className="pulse"
            style={{
              marginBottom: 24,
              padding: "18px 20px",
              borderRadius: 24,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff",
              display: "flex",
              gap: 12,
              alignItems: "center",
              fontWeight: 700,
            }}
          >
            <Bell size={20} className="spin" />
            Incoming support request detected.
          </div>
        )}

        <DashboardStats tickets={tickets} agentStats={agentStats} />

        {/* main card */}
        <div
          style={{
            padding: "24px",
            borderRadius: 34,
            backdropFilter: "blur(20px)",
            background: isDark ? "rgba(15,23,42,0.78)" : "#fff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.12)",
          }}
        >
          {/* tabs */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 28,
            }}
          >
            {[
              { key: "unassigned", label: "New Queue", icon: AlertCircle },
              { key: "my", label: "My Workload", icon: Clipboard },
              { key: "all", label: "All Records", icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: "13px 18px",
                  borderRadius: 16,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background:
                    filter === tab.key
                      ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                      : isDark
                        ? "rgba(255,255,255,0.05)"
                        : "#f1f5f9",
                  color: filter === tab.key ? "#fff" : colors.textSecondary,
                }}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* content */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <Loader2 size={44} className="spin" color="#6366f1" />
              <p
                style={{
                  marginTop: 16,
                  color: colors.textSecondary,
                  fontWeight: 600,
                }}
              >
                Loading support tickets...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "90px 20px",
                borderRadius: 28,
                background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
                border: `2px dashed ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
              }}
            >
              <div style={{ fontSize: 60, marginBottom: 18 }}>🛸</div>
              <h3
                style={{
                  color: colors.text,
                  fontSize: 24,
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                All Clear!
              </h3>
              <p style={{ color: colors.textSecondary }}>
                No tickets available in this category.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              {filtered.map((ticket) => (
                <AgentTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* responsive styles */}
      <style>{`
        *{ box-sizing:border-box; }
        .spin{ animation:spin 1s linear infinite; }
        .fade-up{ animation:fadeUp .5s ease; }
        .pulse{ animation:pulse 2s infinite; }
        .ticket-card:hover{ transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,0.15); }
        @keyframes spin{ from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes fadeUp{ from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes pulse{ 0%,100%{transform:scale(1);} 50%{transform:scale(1.01);} }
        @media (max-width: 900px){ .modal-grid{ grid-template-columns:1fr !important; } }
        @media (max-width: 768px){ .ticket-card{ padding:18px !important; } }
        @media (max-width: 480px){ .ticket-card{ border-radius:20px !important; } }
      `}</style>

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          agentId={user?.id}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => {
            setTickets((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t)),
            );
          }}
        />
      )}
    </div>
  );
}
