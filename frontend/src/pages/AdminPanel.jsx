import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import {
  getAgents,
  createAgent,
  deleteAgent,
  updateAgent,
  getTickets,
  getStats,
  deleteTicket,
} from "../api";

import {
  BarChart3,
  CheckCircle2,
  CircleDot,
  Circle,
  Clock3,
  Download,
  TrendingUp,
  Building2,
  Zap,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Users,
  LogOut,
  Loader2,
  Shield,
  Activity,
  Settings,
} from "lucide-react";

/* ───────────────── EXPORT CSV ───────────────── */
function exportToCSV(tickets) {
  const headers = [
    "ID",
    "Name",
    "Department",
    "Location",
    "Problem",
    "Priority",
    "Status",
    "Agent",
    "Created At",
    "Resolved At",
  ];

  const rows = tickets.map((t) => [
    t.id,
    t.name,
    t.department,
    t.location,
    t.problem,
    t.priority,
    t.status,
    t.agent?.name || "Unassigned",
    new Date(t.createdAt).toLocaleString("en-GB"),
    t.resolvedAt ? new Date(t.resolvedAt).toLocaleString("en-GB") : "N/A",
  ]);

  let csv = headers.join(",") + "\n";

  rows.forEach((row) => {
    csv +=
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",") +
      "\n";
  });

  const blob = new Blob([csv], {
    type: "text/csv",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = `tickets_${new Date().toISOString().split("T")[0]}.csv`;

  a.click();

  window.URL.revokeObjectURL(url);
}

/* ───────────────── STAT BOX ───────────────── */
function StatBox({ label, value, icon: Icon, color, colors, isDark }) {
  return (
    <div
      style={{
        background: isDark ? "rgba(15,23,42,0.82)" : "#ffffff",

        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,

        borderRadius: "clamp(16px, 2vw, 24px)",

        padding: "clamp(16px, 3vw, 24px)",

        backdropFilter: "blur(14px)",

        boxShadow: isDark
          ? "0 10px 30px rgba(0,0,0,0.28)"
          : "0 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div
          style={{
            width: "clamp(40px, 8vw, 52px)",
            height: "clamp(40px, 8vw, 52px)",
            borderRadius: "clamp(12px, 2vw, 18px)",

            background: `${color}22`,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>

      <div
        style={{
          fontSize: "clamp(20px, 5vw, 36px)",
          fontWeight: 800,
          color,
          marginBottom: 6,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: "clamp(12px, 1.5vw, 14px)",
          color: colors.textSecondary,
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ───────────────── AGENT CARD ───────────────── */
function AgentCard({ agent, onDelete, onToggle, colors, isDark }) {
  return (
    <div
      style={{
        background: isDark ? "rgba(15,23,42,0.82)" : "#ffffff",

        borderRadius: "clamp(16px, 2vw, 24px)",

        padding: "clamp(16px, 3vw, 24px)",

        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,

        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: "clamp(40px, 8vw, 52px)",
              height: "clamp(40px, 8vw, 52px)",

              borderRadius: "clamp(12px, 2vw, 18px)",

              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              color: "#fff",
              fontWeight: 700,
              fontSize: "clamp(14px, 2vw, 18px)",
            }}
          >
            {agent.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3
              style={{
                fontWeight: 700,
                color: colors.text,
                fontSize: "clamp(13px, 2vw, 15px)",
              }}
            >
              {agent.name}
            </h3>

            <p
              style={{
                fontSize: "clamp(11px, 1.5vw, 13px)",
                color: colors.textSecondary,
              }}
            >
              @{agent.username}
            </p>
          </div>
        </div>

        {agent.isActive ? (
          <span
            style={{
              background: "rgba(16,185,129,0.14)",
              color: "#10b981",

              padding: "clamp(4px, 1vw, 6px) clamp(10px, 1.5vw, 12px)",
              borderRadius: 999,

              fontSize: "clamp(10px, 1.5vw, 12px)",
              fontWeight: 600,

              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            <CircleDot className="w-3 h-3" />
            Active
          </span>
        ) : (
          <span
            style={{
              background: "rgba(148,163,184,0.16)",
              color: "#94a3b8",

              padding: "clamp(4px, 1vw, 6px) clamp(10px, 1.5vw, 12px)",
              borderRadius: 999,

              fontSize: "clamp(10px, 1.5vw, 12px)",
              fontWeight: 600,

              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            <Circle className="w-3 h-3" />
            Inactive
          </span>
        )}
      </div>

      <div
        style={{
          paddingTop: "clamp(12px, 1.5vw, 16px)",
          borderTop: `1px solid ${
            isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
          }`,
        }}
      >
        <p
          style={{
            color: colors.textSecondary,
            fontSize: "clamp(11px, 1.5vw, 13px)",
            marginBottom: "clamp(12px, 1.5vw, 18px)",
          }}
        >
          {agent._count?.tickets || 0} tickets assigned
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onToggle(agent)}
            style={{
              flex: 1,
              padding: "clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)",

              borderRadius: "clamp(10px, 1.5vw, 14px)",

              border: "none",

              background: isDark ? "rgba(30,41,59,0.95)" : "#f1f5f9",

              color: colors.text,

              fontWeight: 600,
              fontSize: "clamp(12px, 1.5vw, 13px)",
              cursor: "pointer",
            }}
          >
            {agent.isActive ? "Deactivate" : "Activate"}
          </button>

          <button
            onClick={() => onDelete(agent.id)}
            style={{
              padding: "clamp(8px, 1.5vw, 10px) clamp(10px, 2vw, 14px)",

              borderRadius: "clamp(10px, 1.5vw, 14px)",

              border: "none",

              background: "rgba(239,68,68,0.14)",

              color: "#ef4444",

              cursor: "pointer",
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────── MAIN COMPONENT ───────────────── */
export default function AdminPanel() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const { isDark, colors } = useTheme();

  const [tab, setTab] = useState("overview");

  const [stats, setStats] = useState(null);

  const [agents, setAgents] = useState([]);

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [newAgent, setNewAgent] = useState({
    name: "",
    username: "",
    password: "",
  });

  const [agentError, setAgentError] = useState("");

  const [agentSuccess, setAgentSuccess] = useState("");

  const [creating, setCreating] = useState(false);

  const [deptFilter, setDeptFilter] = useState("all");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
    }

    loadAll();
  }, [user, navigate]);

  const loadAll = async () => {
    setLoading(true);

    try {
      const [s, a, t] = await Promise.all([
        getStats(),
        getAgents(),
        getTickets(),
      ]);

      setStats(s.data);

      setAgents(a.data);

      setTickets(t.data);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async () => {
    setAgentError("");
    setAgentSuccess("");

    if (!newAgent.name || !newAgent.username || !newAgent.password) {
      setAgentError("All fields are required");
      return;
    }

    if (newAgent.password.length < 6) {
      setAgentError("Password must be at least 6 characters");
      return;
    }

    setCreating(true);

    try {
      const res = await createAgent(newAgent);

      setAgents((prev) => [res.data, ...prev]);

      setNewAgent({
        name: "",
        username: "",
        password: "",
      });

      setAgentSuccess(`Agent "${res.data.name}" created successfully!`);

      setTimeout(() => setAgentSuccess(""), 4000);
    } catch (err) {
      setAgentError(err.response?.data?.error || "Could not create agent");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAgent = async (id) => {
    if (!confirm("Remove this agent? This cannot be undone.")) return;

    try {
      await deleteAgent(id);

      setAgents((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Could not delete agent");
    }
  };

  const handleToggleAgent = async (agent) => {
    try {
      const res = await updateAgent(agent.id, {
        isActive: !agent.isActive,
      });

      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, ...res.data } : a)),
      );
    } catch {
      alert("Could not update agent");
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!confirm("Delete this ticket permanently?")) return;

    try {
      await deleteTicket(id);

      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Could not delete ticket");
    }
  };

  const deptCounts = tickets.reduce((acc, t) => {
    acc[t.department] = (acc[t.department] || 0) + 1;

    return acc;
  }, {});

  const deptData = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

  const filtered =
    deptFilter === "all"
      ? tickets
      : tickets.filter((t) => t.department === deptFilter);

  const avgResolutionTime = (() => {
    const resolved = tickets.filter((t) => t.resolvedAt);

    if (resolved.length === 0) return 0;

    const total = resolved.reduce((sum, t) => {
      return sum + (new Date(t.resolvedAt) - new Date(t.createdAt));
    }, 0);

    return Math.round(total / resolved.length / 3600000);
  })();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          background: isDark ? "#020617" : "#f8fafc",
        }}
      >
        <div className="text-center">
          <div
            style={{
              width: 70,
              height: 70,

              borderRadius: "50%",

              border: `4px solid ${
                isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"
              }`,

              borderTopColor: "#6366f1",

              margin: "0 auto 18px",

              animation: "spin 1s linear infinite",
            }}
          />

          <p
            style={{
              color: colors.textSecondary,
            }}
          >
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",

        background: isDark
          ? `
            radial-gradient(circle at top right, rgba(99,102,241,0.14), transparent 26%),
            radial-gradient(circle at bottom left, rgba(168,85,247,0.12), transparent 24%),
            #020617
          `
          : "#f8fafc",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,

          backdropFilter: "blur(14px)",

          background: isDark ? "rgba(2,6,23,0.78)" : "rgba(255,255,255,0.88)",

          borderBottom: `1px solid ${
            isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
          }`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 54,
                height: 54,

                borderRadius: 20,

                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                color: "#fff",

                boxShadow: "0 20px 40px rgba(99,102,241,0.28)",
              }}
            >
              <BarChart3 className="w-7 h-7" />
            </div>

            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: colors.text,
                }}
              >
                Admin Dashboard
              </h1>

              <p
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                }}
              >
                IT Support Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p
                style={{
                  fontWeight: 700,
                  color: colors.text,
                }}
              >
                {user?.username}
              </p>

              <p
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                }}
              >
                Administrator
              </p>
            </div>

            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              style={{
                width: 46,
                height: 46,

                borderRadius: 16,

                border: "none",

                background: isDark ? "rgba(30,41,59,0.95)" : "#ffffff",

                color: colors.text,

                cursor: "pointer",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div
          style={{
            position: "relative",

            borderRadius: 34,

            overflow: "hidden",

            minHeight: 280,

            border: `1px solid ${
              isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
            }`,
          }}
        >
          {/* IMAGE */}
          <img
            src="/IT (4).jpg"
            alt="Admin Hero"
            style={{
              position: "absolute",
              inset: 0,

              width: "100%",
              height: "100%",

              objectFit: "cover",

              filter: "brightness(0.45)",
            }}
          />

          {/* OVERLAY */}
          <div
            style={{
              position: "absolute",
              inset: 0,

              background: `
                linear-gradient(
                  135deg,
                  rgba(2,6,23,0.44),
                  rgba(79,70,229,0.22),
                  rgba(15,23,42,0.38)
                )
              `,
            }}
          />

          {/* CONTENT */}
          <div
            style={{
              position: "relative",
              zIndex: 2,

              padding: 40,

              color: "#fff",
            }}
          >
            <div
              style={{
                width: 74,
                height: 74,

                borderRadius: 22,

                background: "rgba(255,255,255,0.12)",

                backdropFilter: "blur(12px)",

                border: "1px solid rgba(255,255,255,0.12)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                marginBottom: 24,
              }}
            >
              <Shield className="w-10 h-10" />
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem,4vw,3.6rem)",
                fontWeight: 900,

                lineHeight: 1.05,

                marginBottom: 16,
              }}
            >
              Administrative
              <span
                style={{
                  display: "block",

                  background: "linear-gradient(90deg,#c4b5fd,#ffffff)",

                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Control Center
              </span>
            </h1>

            <p
              style={{
                maxWidth: 620,

                color: "rgba(255,255,255,0.82)",

                lineHeight: 1.8,

                fontSize: 15,
              }}
            >
              Monitor tickets, manage support agents, export reports, and
              oversee the complete IT support system from one powerful
              dashboard.
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-3 mt-8 overflow-x-auto pb-2">
          {[
            {
              key: "overview",
              label: "Overview",
              icon: Activity,
            },
            {
              key: "agents",
              label: "Agents",
              icon: Users,
              count: agents.length,
            },
            {
              key: "reports",
              label: "Reports",
              icon: TrendingUp,
            },
            {
              key: "tickets",
              label: "Tickets",
              icon: FileText,
              count: tickets.length,
            },
          ].map((t) => {
            const Icon = t.icon;

            const active = tab === t.key;

            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "14px 20px",

                  borderRadius: 18,

                  border: active
                    ? "none"
                    : `1px solid ${
                        isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                      }`,

                  background: active
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : isDark
                      ? "rgba(15,23,42,0.82)"
                      : "#ffffff",

                  color: active ? "#fff" : colors.text,

                  display: "flex",
                  alignItems: "center",
                  gap: 10,

                  fontWeight: 700,

                  cursor: "pointer",

                  whiteSpace: "nowrap",
                }}
              >
                <Icon className="w-4 h-4" />

                {t.label}

                {t.count !== undefined && (
                  <span
                    style={{
                      padding: "2px 8px",

                      borderRadius: 999,

                      background: active
                        ? "rgba(255,255,255,0.18)"
                        : isDark
                          ? "rgba(255,255,255,0.08)"
                          : "#f1f5f9",

                      fontSize: 11,
                    }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="py-8">
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-8">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <StatBox
                  label="Total Tickets"
                  value={stats?.total || 0}
                  icon={FileText}
                  color="#6366f1"
                  colors={colors}
                  isDark={isDark}
                />

                <StatBox
                  label="Resolved"
                  value={stats?.byStatus?.resolved || 0}
                  icon={CheckCircle2}
                  color="#10b981"
                  colors={colors}
                  isDark={isDark}
                />

                <StatBox
                  label="Open"
                  value={stats?.byStatus?.open || 0}
                  icon={CircleDot}
                  color="#3b82f6"
                  colors={colors}
                  isDark={isDark}
                />

                <StatBox
                  label="In Progress"
                  value={stats?.byStatus?.inProgress || 0}
                  icon={Zap}
                  color="#f59e0b"
                  colors={colors}
                  isDark={isDark}
                />

                <StatBox
                  label="Avg Resolution"
                  value={`${avgResolutionTime}h`}
                  icon={Clock3}
                  color="#8b5cf6"
                  colors={colors}
                  isDark={isDark}
                />

                <StatBox
                  label="High Priority"
                  value={stats?.byPriority?.high || 0}
                  icon={AlertCircle}
                  color="#ef4444"
                  colors={colors}
                  isDark={isDark}
                />
              </div>

              {/* GRID */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* DEPARTMENTS */}
                <div
                  style={{
                    background: isDark ? "rgba(15,23,42,0.82)" : "#ffffff",

                    borderRadius: 24,

                    padding: 28,

                    border: `1px solid ${
                      isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                    }`,
                  }}
                >
                  <h2
                    style={{
                      color: colors.text,

                      fontWeight: 800,

                      fontSize: 18,

                      marginBottom: 24,

                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Building2 className="w-5 h-5" />
                    Tickets by Department
                  </h2>

                  <div className="space-y-5">
                    {deptData.map(([dept, count]) => {
                      const pct = ((count / tickets.length) * 100).toFixed(0);

                      return (
                        <div key={dept}>
                          <div className="flex justify-between mb-2">
                            <span
                              style={{
                                color: colors.text,
                                fontWeight: 600,
                              }}
                            >
                              {dept}
                            </span>

                            <span
                              style={{
                                color: "#6366f1",
                                fontWeight: 700,
                              }}
                            >
                              {count} ({pct}%)
                            </span>
                          </div>

                          <div
                            style={{
                              width: "100%",
                              height: 10,

                              borderRadius: 999,

                              background: isDark
                                ? "rgba(255,255,255,0.06)"
                                : "#e2e8f0",
                            }}
                          >
                            <div
                              style={{
                                width: pct + "%",

                                height: "100%",

                                borderRadius: 999,

                                background:
                                  "linear-gradient(90deg,#6366f1,#8b5cf6)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PRIORITY */}
                <div
                  style={{
                    background: isDark ? "rgba(15,23,42,0.82)" : "#ffffff",

                    borderRadius: 24,

                    padding: 28,

                    border: `1px solid ${
                      isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                    }`,
                  }}
                >
                  <h2
                    style={{
                      color: colors.text,

                      fontWeight: 800,

                      fontSize: 18,

                      marginBottom: 24,

                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <TrendingUp className="w-5 h-5" />
                    Priority Breakdown
                  </h2>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "High",
                        key: "high",
                        color: "#ef4444",
                      },
                      {
                        label: "Medium",
                        key: "medium",
                        color: "#f59e0b",
                      },
                      {
                        label: "Low",
                        key: "low",
                        color: "#10b981",
                      },
                    ].map((p) => (
                      <div
                        key={p.key}
                        style={{
                          padding: 20,

                          borderRadius: 20,

                          background: p.color + "18",

                          textAlign: "center",

                          border: "1px solid " + p.color + "22",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 30,
                            fontWeight: 800,

                            color: p.color,

                            marginBottom: 6,
                          }}
                        >
                          {stats?.byPriority?.[p.key] || 0}
                        </div>

                        <div
                          style={{
                            fontSize: 13,

                            color: colors.textSecondary,
                          }}
                        >
                          {p.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AGENTS */}
          {tab === "agents" && (
            <div className="space-y-8">
              {/* CREATE AGENT CARD */}
              <div
                style={{
                  background: isDark
                    ? "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92))"
                    : "#ffffff",

                  borderRadius: 30,

                  padding: 32,

                  border: `1px solid ${
                    isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"
                  }`,

                  backdropFilter: "blur(16px)",

                  boxShadow: isDark
                    ? "0 20px 50px rgba(0,0,0,0.45)"
                    : "0 20px 40px rgba(0,0,0,0.05)",
                }}
              >
                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2
                      style={{
                        color: colors.text,
                        fontWeight: 800,
                        fontSize: 24,
                        marginBottom: 6,
                      }}
                    >
                      Register New Agent
                    </h2>

                    <p
                      style={{
                        color: colors.textSecondary,
                        fontSize: 14,
                      }}
                    >
                      Add and manage support agents for the IT helpdesk
                    </p>
                  </div>

                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 20,
                      background:
                        "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))",

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Users className="w-7 h-7 text-indigo-400" />
                  </div>
                </div>

                {/* INPUTS */}
                <div className="grid md:grid-cols-3 gap-5 mb-5">
                  {/* FULL NAME */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: colors.textSecondary,
                      }}
                    >
                      Full Name
                    </label>

                    <input
                      type="text"
                      placeholder="e.g John Doe"
                      value={newAgent.name}
                      onChange={(e) =>
                        setNewAgent((p) => ({
                          ...p,
                          name: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "14px 16px",

                        borderRadius: 16,

                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.08)" : "#dbe3ea"
                        }`,

                        background: isDark ? "rgba(2,6,23,0.65)" : "#ffffff",

                        color: colors.text,

                        outline: "none",

                        fontSize: 14,

                        transition: "0.25s",
                      }}
                    />
                  </div>

                  {/* USERNAME */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: colors.textSecondary,
                      }}
                    >
                      Username
                    </label>

                    <input
                      type="text"
                      placeholder="e.g johndoe"
                      value={newAgent.username}
                      onChange={(e) =>
                        setNewAgent((p) => ({
                          ...p,
                          username: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "14px 16px",

                        borderRadius: 16,

                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.08)" : "#dbe3ea"
                        }`,

                        background: isDark ? "rgba(2,6,23,0.65)" : "#ffffff",

                        color: colors.text,

                        outline: "none",

                        fontSize: 14,
                      }}
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: colors.textSecondary,
                      }}
                    >
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newAgent.password}
                      onChange={(e) =>
                        setNewAgent((p) => ({
                          ...p,
                          password: e.target.value,
                        }))
                      }
                      style={{
                        width: "100%",
                        padding: "14px 16px",

                        borderRadius: 16,

                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.08)" : "#dbe3ea"
                        }`,

                        background: isDark ? "rgba(2,6,23,0.65)" : "#ffffff",

                        color: colors.text,

                        outline: "none",

                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>

                {/* ERROR */}
                {agentError && (
                  <div
                    style={{
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.25)",

                      color: "#f87171",

                      padding: "14px 16px",

                      borderRadius: 16,

                      marginBottom: 18,

                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {agentError}
                  </div>
                )}

                {/* SUCCESS */}
                {agentSuccess && (
                  <div
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      border: "1px solid rgba(16,185,129,0.25)",

                      color: "#34d399",

                      padding: "14px 16px",

                      borderRadius: 16,

                      marginBottom: 18,

                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {agentSuccess}
                  </div>
                )}

                {/* BUTTON */}
                <button
                  onClick={handleCreateAgent}
                  disabled={creating}
                  style={{
                    width: "100%",

                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",

                    color: "#fff",

                    padding: "15px 20px",

                    borderRadius: 18,

                    border: "none",

                    fontWeight: 700,

                    fontSize: 15,

                    cursor: "pointer",

                    boxShadow: "0 10px 30px rgba(99,102,241,0.35)",

                    transition: "0.25s",

                    opacity: creating ? 0.7 : 1,
                  }}
                >
                  {creating ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Agent...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Agent
                    </div>
                  )}
                </button>
              </div>

              {/* AGENT LIST */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2
                    style={{
                      color: colors.text,
                      fontSize: 22,
                      fontWeight: 800,
                    }}
                  >
                    Support Agents
                  </h2>

                  <div
                    style={{
                      background: isDark ? "rgba(255,255,255,0.06)" : "#eef2ff",

                      color: isDark ? "#cbd5e1" : "#4f46e5",

                      padding: "8px 14px",

                      borderRadius: 999,

                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {agents.length} Agents
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {agents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onDelete={handleDeleteAgent}
                      onToggle={handleToggleAgent}
                      colors={colors}
                      isDark={isDark}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REPORTS */}
          {tab === "reports" && (
            <div className="space-y-6">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2
                    style={{
                      color: colors.text,
                      fontWeight: 900,
                      fontSize: "clamp(1.5rem,3vw,2rem)",
                      marginBottom: 6,
                    }}
                  >
                    Reports & Analytics
                  </h2>

                  <p
                    style={{
                      color: colors.textSecondary,
                      fontSize: "clamp(12px,2vw,14px)",
                    }}
                  >
                    Export and monitor all support ticket records
                  </p>
                </div>

                <button
                  onClick={() => exportToCSV(tickets)}
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: "#fff",

                    padding: "14px 20px",

                    borderRadius: 18,

                    border: "none",

                    fontWeight: 700,

                    fontSize: "clamp(13px,2vw,15px)",

                    cursor: "pointer",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,

                    width: "100%",
                    maxWidth: 220,

                    boxShadow: "0 14px 30px rgba(99,102,241,0.28)",

                    transition: "0.25s",
                  }}
                >
                  <Download className="w-5 h-5" />
                  Export CSV
                </button>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Reports",
                    value: tickets.length,
                    icon: FileText,
                    color: "#6366f1",
                  },
                  {
                    label: "Resolved",
                    value: stats?.byStatus?.resolved || 0,
                    icon: CheckCircle2,
                    color: "#10b981",
                  },
                  {
                    label: "Open",
                    value: stats?.byStatus?.open || 0,
                    icon: CircleDot,
                    color: "#3b82f6",
                  },
                  {
                    label: "In Progress",
                    value: stats?.byStatus?.inProgress || 0,
                    icon: Loader2,
                    color: "#f59e0b",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      style={{
                        background: isDark ? "rgba(15,23,42,0.82)" : "#ffffff",

                        borderRadius: 22,

                        padding: "clamp(16px,2vw,22px)",

                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                        }`,

                        backdropFilter: "blur(12px)",

                        boxShadow: isDark
                          ? "0 12px 30px rgba(0,0,0,0.25)"
                          : "0 12px 30px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          style={{
                            width: 48,
                            height: 48,

                            borderRadius: 16,

                            background: item.color + "18",

                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: item.color }}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "clamp(1.4rem,3vw,2rem)",
                          fontWeight: 900,
                          color: item.color,
                          marginBottom: 6,
                        }}
                      >
                        {item.value}
                      </div>

                      <div
                        style={{
                          color: colors.textSecondary,
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TABLE CARD */}
              <div
                style={{
                  background: isDark
                    ? "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92))"
                    : "#ffffff",

                  borderRadius: "clamp(22px,3vw,30px)",

                  overflow: "hidden",

                  border: `1px solid ${
                    isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                  }`,

                  backdropFilter: "blur(14px)",

                  boxShadow: isDark
                    ? "0 20px 50px rgba(0,0,0,0.35)"
                    : "0 20px 50px rgba(0,0,0,0.05)",
                }}
              >
                {/* TABLE HEADER */}
                <div
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  style={{
                    padding: "clamp(18px,3vw,28px)",

                    borderBottom: `1px solid ${
                      isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                    }`,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        color: colors.text,
                        fontWeight: 800,
                        fontSize: "clamp(18px,2vw,22px)",
                        marginBottom: 4,
                      }}
                    >
                      Ticket Reports
                    </h3>

                    <p
                      style={{
                        color: colors.textSecondary,
                        fontSize: 13,
                      }}
                    >
                      Full breakdown of all submitted support tickets
                    </p>
                  </div>

                  <div
                    style={{
                      background: isDark ? "rgba(255,255,255,0.06)" : "#eef2ff",

                      color: isDark ? "#cbd5e1" : "#4f46e5",

                      padding: "10px 16px",

                      borderRadius: 999,

                      fontWeight: 700,
                      fontSize: 13,

                      width: "fit-content",
                    }}
                  >
                    {tickets.length} Records
                  </div>
                </div>

                {/* MOBILE CARDS */}
                <div className="block lg:hidden p-4 space-y-4">
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        background: isDark ? "rgba(2,6,23,0.72)" : "#f8fafc",

                        borderRadius: 20,

                        padding: 18,

                        border: `1px solid ${
                          isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                        }`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p
                            style={{
                              color: "#6366f1",
                              fontWeight: 800,
                              fontSize: 15,
                              marginBottom: 4,
                            }}
                          >
                            Ticket #{t.id}
                          </p>

                          <p
                            style={{
                              color: colors.text,
                              fontWeight: 700,
                              lineHeight: 1.5,
                              fontSize: 14,
                            }}
                          >
                            {t.problem}
                          </p>
                        </div>

                        <div
                          style={{
                            padding: "6px 10px",

                            borderRadius: 999,

                            background:
                              t.priority === "high"
                                ? "rgba(239,68,68,0.15)"
                                : t.priority === "medium"
                                  ? "rgba(245,158,11,0.15)"
                                  : "rgba(16,185,129,0.15)",

                            color:
                              t.priority === "high"
                                ? "#ef4444"
                                : t.priority === "medium"
                                  ? "#f59e0b"
                                  : "#10b981",

                            fontSize: 11,
                            fontWeight: 700,

                            textTransform: "capitalize",
                          }}
                        >
                          {t.priority}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p
                            style={{
                              color: colors.textSecondary,
                              fontSize: 11,
                              marginBottom: 4,
                            }}
                          >
                            STATUS
                          </p>

                          <p
                            style={{
                              color: colors.text,
                              fontWeight: 700,
                              textTransform: "capitalize",
                              fontSize: 13,
                            }}
                          >
                            {t.status}
                          </p>
                        </div>

                        <div>
                          <p
                            style={{
                              color: colors.textSecondary,
                              fontSize: 11,
                              marginBottom: 4,
                            }}
                          >
                            DEPARTMENT
                          </p>

                          <p
                            style={{
                              color: colors.text,
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {t.department}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        style={{
                          background: isDark
                            ? "rgba(255,255,255,0.03)"
                            : "#f8fafc",
                        }}
                      >
                        {[
                          "ID",
                          "Problem",
                          "Priority",
                          "Status",
                          "Department",
                          "Agents",
                        ].map((head) => (
                          <th
                            key={head}
                            style={{
                              padding: "18px 22px",

                              textAlign: "left",

                              color: colors.textSecondary,

                              fontSize: 12,

                              fontWeight: 700,

                              letterSpacing: 0.6,

                              textTransform: "uppercase",

                              whiteSpace: "nowrap",
                            }}
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {tickets.map((t, i) => (
                        <tr
                          key={t.id}
                          style={{
                            borderTop:
                              i === 0
                                ? "none"
                                : `1px solid ${
                                    isDark
                                      ? "rgba(255,255,255,0.05)"
                                      : "#eef2f7"
                                  }`,
                          }}
                        >
                          <td
                            style={{
                              padding: "20px 22px",

                              color: "#6366f1",

                              fontWeight: 800,

                              whiteSpace: "nowrap",
                            }}
                          >
                            #{t.id}
                          </td>

                          <td
                            style={{
                              padding: "20px 22px",

                              color: colors.text,

                              fontWeight: 600,

                              minWidth: 260,
                            }}
                          >
                            <div
                              style={{
                                maxWidth: 350,

                                overflow: "hidden",

                                textOverflow: "ellipsis",

                                display: "-webkit-box",

                                WebkitLineClamp: 2,

                                WebkitBoxOrient: "vertical",

                                lineHeight: 1.5,
                              }}
                            >
                              {t.problem}
                            </div>
                          </td>

                          <td style={{ padding: "20px 22px" }}>
                            <span
                              style={{
                                padding: "8px 12px",

                                borderRadius: 999,

                                background:
                                  t.priority === "high"
                                    ? "rgba(239,68,68,0.15)"
                                    : t.priority === "medium"
                                      ? "rgba(245,158,11,0.15)"
                                      : "rgba(16,185,129,0.15)",

                                color:
                                  t.priority === "high"
                                    ? "#ef4444"
                                    : t.priority === "medium"
                                      ? "#f59e0b"
                                      : "#10b981",

                                fontSize: 12,

                                fontWeight: 700,

                                textTransform: "capitalize",
                              }}
                            >
                              {t.priority}
                            </span>
                          </td>

                          <td
                            style={{
                              padding: "20px 22px",

                              color: colors.text,

                              fontWeight: 600,

                              textTransform: "capitalize",
                            }}
                          >
                            {t.status}
                          </td>

                          <td
                            style={{
                              padding: "20px 22px",

                              color: colors.textSecondary,

                              fontWeight: 600,
                            }}
                          >
                            {t.department}
                          </td>
                          <td
                            style={{
                              padding: "20px 22px",

                              color: colors.textSecondary,

                              fontWeight: 600,
                            }}
                          >
                            {(
                              t.agent?.name ||
                              (t.agents && t.agents.length
                                ? t.agents.map((a) => a.name).join(", ")
                                : null) ||
                              "Unassigned"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TICKETS */}
          {tab === "tickets" && (
            <div
              style={{
                background: isDark
                  ? "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92))"
                  : "#ffffff",

                borderRadius: "clamp(22px,3vw,30px)",

                overflow: "hidden",

                border: `1px solid ${
                  isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                }`,

                backdropFilter: "blur(14px)",

                boxShadow: isDark
                  ? "0 20px 50px rgba(0,0,0,0.35)"
                  : "0 20px 50px rgba(0,0,0,0.05)",
              }}
            >
              {/* HEADER */}
              <div
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                style={{
                  padding: "clamp(18px,3vw,28px)",

                  borderBottom: `1px solid ${
                    isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                  }`,
                }}
              >
                <div>
                  <h2
                    style={{
                      color: colors.text,
                      fontWeight: 900,
                      fontSize: "clamp(1.4rem,3vw,2rem)",
                      marginBottom: 6,
                    }}
                  >
                    Ticket Management
                  </h2>

                  <p
                    style={{
                      color: colors.textSecondary,
                      fontSize: 14,
                    }}
                  >
                    View and manage all support requests
                  </p>
                </div>

                <div
                  style={{
                    background: isDark ? "rgba(255,255,255,0.06)" : "#eef2ff",

                    color: isDark ? "#cbd5e1" : "#4f46e5",

                    padding: "10px 16px",

                    borderRadius: 999,

                    fontWeight: 700,
                    fontSize: 13,

                    width: "fit-content",
                  }}
                >
                  {tickets.length} Tickets
                </div>
              </div>

              {/* MOBILE VIEW */}
              <div className="block lg:hidden p-4 space-y-4">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: isDark ? "rgba(2,6,23,0.72)" : "#f8fafc",

                      borderRadius: 20,

                      padding: 18,

                      border: `1px solid ${
                        isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                      }`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p
                          style={{
                            color: "#6366f1",
                            fontWeight: 800,
                            marginBottom: 4,
                          }}
                        >
                          Ticket #{t.id}
                        </p>

                        <h3
                          style={{
                            color: colors.text,
                            fontWeight: 800,
                            fontSize: 15,
                          }}
                        >
                          {t.name}
                        </h3>
                      </div>

                      <span
                        style={{
                          padding: "6px 10px",

                          borderRadius: 999,

                          background:
                            t.status === "resolved"
                              ? "rgba(16,185,129,0.14)"
                              : t.status === "inProgress"
                                ? "rgba(245,158,11,0.14)"
                                : "rgba(59,130,246,0.14)",

                          color:
                            t.status === "resolved"
                              ? "#10b981"
                              : t.status === "inProgress"
                                ? "#f59e0b"
                                : "#3b82f6",

                          fontSize: 11,

                          fontWeight: 700,

                          textTransform: "capitalize",
                        }}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div>
                        <p
                          style={{
                            color: colors.textSecondary,
                            fontSize: 11,
                            marginBottom: 3,
                          }}
                        >
                          DEPARTMENT
                        </p>

                        <p
                          style={{
                            color: colors.text,
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {t.department}
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            color: colors.textSecondary,
                            fontSize: 11,
                            marginBottom: 3,
                          }}
                        >
                          ISSUE
                        </p>

                        <p
                          style={{
                            color: colors.text,
                            lineHeight: 1.6,
                            fontSize: 13,
                          }}
                        >
                          {t.problem}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTicket(t.id)}
                      style={{
                        width: "100%",

                        background: "rgba(239,68,68,0.12)",

                        color: "#ef4444",

                        border: "1px solid rgba(239,68,68,0.18)",

                        padding: "12px 14px",

                        borderRadius: 14,

                        cursor: "pointer",

                        fontWeight: 700,

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Ticket
                    </button>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        background: isDark
                          ? "rgba(255,255,255,0.03)"
                          : "#f8fafc",
                      }}
                    >
                      {["ID", "Staff", "Department", "Status", "Action"].map(
                        (head) => (
                          <th
                            key={head}
                            style={{
                              padding: "18px 22px",

                              textAlign: "left",

                              color: colors.textSecondary,

                              fontSize: 12,

                              fontWeight: 700,

                              letterSpacing: 0.6,

                              textTransform: "uppercase",

                              whiteSpace: "nowrap",
                            }}
                          >
                            {head}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {tickets.map((t, i) => (
                      <tr
                        key={t.id}
                        style={{
                          borderTop:
                            i === 0
                              ? "none"
                              : `1px solid ${
                                  isDark ? "rgba(255,255,255,0.05)" : "#eef2f7"
                                }`,
                        }}
                      >
                        <td
                          style={{
                            padding: "20px 22px",

                            color: "#6366f1",

                            fontWeight: 800,
                          }}
                        >
                          #{t.id}
                        </td>

                        <td
                          style={{
                            padding: "20px 22px",

                            color: colors.text,

                            fontWeight: 700,
                          }}
                        >
                          {t.name}
                        </td>

                        <td
                          style={{
                            padding: "20px 22px",

                            color: colors.textSecondary,

                            fontWeight: 600,
                          }}
                        >
                          {t.department}
                        </td>

                        <td style={{ padding: "20px 22px" }}>
                          <span
                            style={{
                              padding: "8px 12px",

                              borderRadius: 999,

                              background:
                                t.status === "resolved"
                                  ? "rgba(16,185,129,0.14)"
                                  : t.status === "inProgress"
                                    ? "rgba(245,158,11,0.14)"
                                    : "rgba(59,130,246,0.14)",

                              color:
                                t.status === "resolved"
                                  ? "#10b981"
                                  : t.status === "inProgress"
                                    ? "#f59e0b"
                                    : "#3b82f6",

                              fontSize: 12,

                              fontWeight: 700,

                              textTransform: "capitalize",
                            }}
                          >
                            {t.status}
                          </span>
                        </td>

                        <td style={{ padding: "20px 22px" }}>
                          <button
                            onClick={() => handleDeleteTicket(t.id)}
                            style={{
                              background: "rgba(239,68,68,0.12)",

                              color: "#ef4444",

                              border: "1px solid rgba(239,68,68,0.18)",

                              padding: "10px 14px",

                              borderRadius: 12,

                              cursor: "pointer",

                              fontWeight: 700,

                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
