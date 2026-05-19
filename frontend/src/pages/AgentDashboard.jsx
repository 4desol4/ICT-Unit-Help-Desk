import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

// ─────────────────────────────────────────────
// Ticket Card
// ─────────────────────────────────────────────
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
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
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
// Modal
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

  useEffect(() => {
    loadMessages();
  }, [ticket.id]);

  const loadMessages = async () => {
    try {
      const res = await getMessages(ticket.id);
      setMessages(res.data);
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

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      alert("Failed to update ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMsg.trim()) return;

    setLoadingMsg(true);

    try {
      const msg = await sendAgentMessage(ticket.id, { text: newMsg });

      setMessages((prev) => [...prev, msg]);

      setNewMsg("");
    } catch (err) {
      alert("Failed to send message");
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
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        padding: 16,
        background: "rgba(2,6,23,0.82)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 980,
          maxHeight: "95vh",
          overflow: "hidden",
          borderRadius: 28,
          background: isDark ? "rgba(15,23,42,0.98)" : "#fff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <div
          style={{
            padding: "20px 22px",
            borderBottom: `1px solid ${
              isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
            }`,
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
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>

          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
              color: colors.text,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div
          className="modal-grid"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 22,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          {/* left */}
          <div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: colors.text,
                marginBottom: 18,
              }}
            >
              Ticket Details
            </h2>

            <div
              style={{
                padding: 18,
                borderRadius: 18,
                lineHeight: 1.7,
                marginBottom: 20,
                background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                border: `1px solid ${
                  isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                }`,
                color: colors.text,
              }}
            >
              {ticket.problem}
            </div>

            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              {[
                {
                  label: "User",
                  value: ticket.name,
                },
                {
                  label: "Department",
                  value: ticket.department,
                },
                {
                  label: "Location",
                  value: ticket.location,
                },
                {
                  label: "Created",
                  value: date,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                    paddingBottom: 10,
                    borderBottom: `1px solid ${
                      isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9"
                    }`,
                  }}
                >
                  <span
                    style={{
                      color: colors.textSecondary,
                      fontSize: 13,
                    }}
                  >
                    {item.label}
                  </span>

                  <strong
                    style={{
                      color: colors.text,
                      fontSize: 13,
                    }}
                  >
                    {item.value}
                  </strong>
                </div>
              ))}
            </div>

            {/* status */}
            <div style={{ marginTop: 28 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 12,
                  fontSize: 12,
                  fontWeight: 800,
                  color: colors.textSecondary,
                  textTransform: "uppercase",
                }}
              >
                Update Status
              </label>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 18,
                }}
              >
                {["open", "in_progress", "resolved"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    style={{
                      padding: "12px 18px",
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
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>

              {status === "resolved" && (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the solution..."
                  style={{
                    width: "100%",
                    minHeight: 110,
                    resize: "vertical",
                    borderRadius: 18,
                    padding: 16,
                    outline: "none",
                    color: colors.text,
                    background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                    border: `1px solid ${
                      isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"
                    }`,
                  }}
                />
              )}
            </div>
          </div>

          {/* right */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <MessageCircle size={18} color={colors.text} />

              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: colors.text,
                }}
              >
                Messages
              </h3>
            </div>

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
                border: `1px solid ${
                  isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0"
                }`,
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
                    key={i}
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
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type message..."
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: 16,
                  outline: "none",
                  border: `1px solid ${
                    isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"
                  }`,
                  background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                  color: colors.text,
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
            borderTop: `1px solid ${
              isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0"
            }`,
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
            {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}

            {saved ? "Updated!" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
export default function AgentDashboard() {
  const { user } = useAuth();
  const { isDark, colors } = useTheme();

  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTicket, setSelected] = useState(null);

  const [filter, setFilter] = useState("unassigned");

  const [newAlert, setNewAlert] = useState(false);

  const [agentStats, setAgentStats] = useState({
    resolvedCount: 0,
  });

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

  useEffect(() => {
    socket.on("new_ticket", (t) => {
      setTickets((prev) => [t, ...prev]);

      setNewAlert(true);

      setTimeout(() => {
        setNewAlert(false);
      }, 5000);
    });

    socket.on("ticket_updated", (u) => {
      setTickets((prev) => prev.map((t) => (t.id === u.id ? u : t)));
    });

    return () => {
      socket.off("new_ticket");
      socket.off("ticket_updated");
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
            border: `1px solid ${
              isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"
            }`,
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
              {
                key: "unassigned",
                label: "New Queue",
                icon: AlertCircle,
              },
              {
                key: "my",
                label: "My Workload",
                icon: Clipboard,
              },
              {
                key: "all",
                label: "All Records",
                icon: BarChart3,
              },
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
            <div
              style={{
                textAlign: "center",
                padding: "100px 0",
              }}
            >
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
                border: `2px dashed ${
                  isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                }`,
              }}
            >
              <div
                style={{
                  fontSize: 60,
                  marginBottom: 18,
                }}
              >
                🛸
              </div>

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

              <p
                style={{
                  color: colors.textSecondary,
                }}
              >
                No tickets available in this category.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 18,
              }}
            >
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
        *{
          box-sizing:border-box;
        }

        .spin{
          animation:spin 1s linear infinite;
        }

        .fade-up{
          animation:fadeUp .5s ease;
        }

        .pulse{
          animation:pulse 2s infinite;
        }

        .ticket-card:hover{
          transform:translateY(-4px);
          box-shadow:0 20px 40px rgba(0,0,0,0.15);
        }

        @keyframes spin{
          from{transform:rotate(0deg);}
          to{transform:rotate(360deg);}
        }

        @keyframes fadeUp{
          from{
            opacity:0;
            transform:translateY(20px);
          }
          to{
            opacity:1;
            transform:translateY(0);
          }
        }

        @keyframes pulse{
          0%,100%{
            transform:scale(1);
          }
          50%{
            transform:scale(1.01);
          }
        }

        @media (max-width: 900px){
          .modal-grid{
            grid-template-columns:1fr !important;
          }
        }

        @media (max-width: 768px){

          .ticket-card{
            padding:18px !important;
          }

        }

        @media (max-width: 480px){

          .ticket-card{
            border-radius:20px !important;
          }

        }
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
