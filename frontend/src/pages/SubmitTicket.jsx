import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitTicket, getMyTickets } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

import {
  Clipboard,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Plus,
  Send,
  Loader2,
  Lightbulb,
  Circle,
  Wrench,
  ArrowLeft,
  MessageCircle,
  Eye,
  ChevronRight,
} from "lucide-react";

const DEPARTMENTS = [
  "Accounts",
  "HR",
  "IT",
  "Admin",
  "Operations",
  "Sales",
  "Marketing",
  "Management",
  "Reception",
  "Other",
];

const PRIORITIES = [
  {
    value: "high",
    label: "High — Urgent, blocking my work",
    color: "#ef4444",
  },
  {
    value: "medium",
    label: "Medium — Needs fixing soon",
    color: "#f59e0b",
  },
  {
    value: "low",
    label: "Low — Minor issue, not urgent",
    color: "#10b981",
  },
];


function PastTicketsPanel({ tickets, onSelectTicket }) {
  const [filter, setFilter] = useState("open");
  const navigate = useNavigate();
  const { isDark, colors } = useTheme();

  const filtered =
    filter === "open"
      ? tickets.filter((t) => t.status !== "resolved")
      : tickets.filter((t) => t.status === "resolved");

  // LIMIT TO 5 TICKETS
  const visibleTickets = filtered.slice(0, 5);

  return (
    <div
      style={{
        background: isDark
          ? "rgba(15,23,42,0.78)"
          : "rgba(255,255,255,0.92)",

        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",

        borderRadius: 28,

        padding: 22,

        border: `1px solid ${
          isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
        }`,

        position: "sticky",
        top: 90,

        boxShadow: isDark
          ? "0 20px 50px rgba(0,0,0,0.35)"
          : "0 20px 45px rgba(99,102,241,0.08)",

        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.16)",
          filter: "blur(80px)",
          top: -50,
          right: -50,
        }}
      />

      {/* Header */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              background:
                "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 10px 25px rgba(99,102,241,0.35)",
            }}
          >
            <Clipboard size={20} color="#fff" />
          </div>

          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 800,
                color: colors.text,
              }}
            >
              Your Tickets
            </h3>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: colors.textSecondary,
              }}
            >
              Quick access to recent tickets
            </p>
          </div>
        </div>

        <div
          style={{
            padding: "7px 12px",
            borderRadius: 999,
            background: isDark
              ? "rgba(99,102,241,0.15)"
              : "#eef2ff",

            color: "#6366f1",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {filtered.length}
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 18,
          position: "relative",
          zIndex: 2,
        }}
      >
        {[
          { key: "open", label: "Open" },
          { key: "resolved", label: "Resolved" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              flex: 1,
              padding: "11px 12px",
              borderRadius: 14,
              border:
                filter === tab.key
                  ? "1px solid #6366f1"
                  : `1px solid ${colors.border}`,

              background:
                filter === tab.key
                  ? "linear-gradient(135deg,#6366f1,#4f46e5)"
                  : isDark
                    ? "rgba(255,255,255,0.03)"
                    : "#f8fafc",

              color:
                filter === tab.key
                  ? "#fff"
                  : colors.textSecondary,

              fontWeight: 700,
              cursor: "pointer",
              transition: "0.25s",
              fontSize: 13,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          position: "relative",
          zIndex: 2,
        }}
      >
        {visibleTickets.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              justifyContent: "center", 
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              padding: "32px 10px",
              borderRadius: 20,
              background: isDark
                ? "rgba(255,255,255,0.03)"
                : "#f8fafc",

              border: `1px dashed ${colors.border}`,
            }}
          >
            <Clipboard
              size={40}
              color={isDark ? "#475569" : "#cbd5e1"}
            />

            <p
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                marginTop: 12,
              }}
            >
              No tickets found
            </p>
          </div>
        ) : (
          visibleTickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                padding: 16,
                borderRadius: 18,

                background: isDark
                  ? "rgba(255,255,255,0.03)"
                  : "#fff",

                border: `1px solid ${colors.border}`,

                borderLeft: `4px solid ${
                  ticket.priority === "high"
                    ? "#ef4444"
                    : ticket.priority === "medium"
                      ? "#f59e0b"
                      : "#10b981"
                }`,

                boxShadow: isDark
                  ? "0 10px 30px rgba(0,0,0,0.2)"
                  : "0 8px 20px rgba(15,23,42,0.06)",

                transition: "0.25s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#6366f1",
                  }}
                >
                  Ticket #{ticket.id}
                </div>

                <div
                  style={{
                    padding: "5px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,

                    background:
                      ticket.status === "resolved"
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(59,130,246,0.12)",

                    color:
                      ticket.status === "resolved"
                        ? "#16a34a"
                        : "#2563eb",

                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {ticket.status === "resolved" ? (
                    <>
                      <CheckCircle2 size={12} />
                      Resolved
                    </>
                  ) : (
                    <>
                      <Circle size={12} />
                      Open
                    </>
                  )}
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: colors.text,
                  fontWeight: 600,
                }}
              >
                {ticket.problem.substring(0, 65)}
                {ticket.problem.length > 65 ? "..." : ""}
              </p>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => onSelectTicket(ticket.id)}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    background: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "#f8fafc",

                    color: colors.text,
                    cursor: "pointer",
                    fontWeight: 700,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Eye size={14} />
                  View
                </button>

                <button
                  onClick={() =>
                    navigate(`/ticket/${ticket.id}`)
                  }
                  style={{
                    flex: 1,
                    minWidth: 120,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "none",
                    background:
                      "linear-gradient(135deg,#6366f1,#8b5cf6)",

                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 700,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,

                    boxShadow:
                      "0 10px 20px rgba(99,102,241,0.25)",
                  }}
                >
                  <MessageCircle size={14} />
                  Open Chat
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All */}
      {filtered.length > 5 && (
        <button
          onClick={() => navigate("/my-tickets")}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "13px",

            borderRadius: 16,

            border: `1px solid ${colors.border}`,

            background: isDark
              ? "rgba(255,255,255,0.04)"
              : "#f8fafc",

            color: colors.text,

            fontWeight: 700,
            cursor: "pointer",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          View All Tickets
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

export default function SubmitTicket() {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { isDark, colors } = useTheme();

  const [form, setForm] = useState({
    name: "",
    department: "",
    location: "",
    problem: "",
    priority: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pastTickets, setPastTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] =
    useState(null);

  useEffect(() => {
    if (!user || user.role !== "user") {
      navigate("/user/login");
      return;
    }

    loadPastTickets();
  }, [user]);

  const loadPastTickets = async () => {
    try {
      const res = await getMyTickets();
      setPastTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validate = () => {
    const e = {};

    if (!form.name.trim())
      e.name = "Please enter your name";

    if (!form.department)
      e.department = "Please select department";

    if (!form.location.trim())
      e.location = "Please enter your location";

    if (form.problem.length < 10)
      e.problem =
        "Please describe the problem properly";

    if (!form.priority)
      e.priority = "Please select priority";

    return e;
  };

  const handleSubmit = async () => {
    const e = validate();

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setLoading(true);

    try {
      await submitTicket(form);

      setSuccess(true);

      setForm({
        name: "",
        department: "",
        location: "",
        problem: "",
        priority: "",
      });

      loadPastTickets();
    } catch (err) {
      setErrors({
        submit:
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
if (selectedTicketId) {
  const ticket = pastTickets.find((t) => t.id === selectedTicketId);

  if (!ticket) return null;

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

        padding: "32px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        {/* BACK BUTTON */}
        <button
          onClick={() => setSelectedTicketId(null)}
          style={{
            background: isDark
              ? "rgba(15,23,42,0.82)"
              : "#ffffff",

            border: `1px solid ${
              isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
            }`,

            color: colors.text,

            padding: "12px 18px",

            borderRadius: 16,

            cursor: "pointer",

            marginBottom: 24,

            fontWeight: 700,

            display: "flex",
            alignItems: "center",
            gap: 8,

            backdropFilter: "blur(14px)",

            boxShadow: isDark
              ? "0 10px 30px rgba(0,0,0,0.28)"
              : "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <ArrowLeft size={16} />
          Back to Submit Ticket
        </button>

        {/* MAIN CARD */}
        <div
          style={{
            background: isDark
              ? "rgba(15,23,42,0.82)"
              : "#ffffff",

            borderRadius: 30,

            padding: 30,

            border: `1px solid ${
              isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
            }`,

            backdropFilter: "blur(14px)",

            boxShadow: isDark
              ? "0 20px 50px rgba(0,0,0,0.45)"
              : "0 20px 40px rgba(0,0,0,0.05)",
          }}
        >
          {/* TOP */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 20,
              marginBottom: 28,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "clamp(1.8rem,4vw,2.3rem)",
                  fontWeight: 900,
                  color: colors.text,
                  marginBottom: 10,
                }}
              >
                Ticket #{ticket.id}
              </h1>

              <p
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                }}
              >
                Track your support request and communicate with the ICT team.
              </p>
            </div>

            {/* STATUS */}
            <span
              style={{
                padding: "10px 16px",

                borderRadius: 999,

                fontSize: 12,
                fontWeight: 700,

                background:
                  ticket.status === "resolved"
                    ? "rgba(16,185,129,0.14)"
                    : ticket.status === "in_progress"
                      ? "rgba(245,158,11,0.14)"
                      : "rgba(59,130,246,0.14)",

                color:
                  ticket.status === "resolved"
                    ? "#10b981"
                    : ticket.status === "in_progress"
                      ? "#f59e0b"
                      : "#3b82f6",

                display: "inline-flex",
                alignItems: "center",
                gap: 8,

                border:
                  ticket.status === "resolved"
                    ? "1px solid rgba(16,185,129,0.2)"
                    : ticket.status === "in_progress"
                      ? "1px solid rgba(245,158,11,0.2)"
                      : "1px solid rgba(59,130,246,0.2)",
              }}
            >
              {ticket.status === "resolved" ? (
                <>
                  <CheckCircle2 size={14} />
                  Resolved
                </>
              ) : ticket.status === "in_progress" ? (
                <>
                  <Zap size={14} />
                  In Progress
                </>
              ) : (
                <>
                  <Circle size={14} />
                  Open
                </>
              )}
            </span>
          </div>

          {/* DETAILS GRID */}
          <div
            style={{
              background: isDark
                ? "rgba(2,6,23,0.5)"
                : "#f8fafc",

              borderRadius: 24,

              padding: 22,

              marginBottom: 28,

              display: "grid",

              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",

              gap: 18,

              border: `1px solid ${
                isDark ? "rgba(255,255,255,0.04)" : "#e2e8f0"
              }`,
            }}
          >
            {[
              {
                label: "Department",
                value: ticket.department,
              },
              {
                label: "Location",
                value: ticket.location,
              },
              {
                label: "Priority",
                value: ticket.priority,
              },
              {
                label: "Created",
                value: new Date(
                  ticket.createdAt,
                ).toLocaleDateString("en-GB"),
              },
            ].map((item, idx) => (
              <div key={idx}>
                <div
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    marginBottom: 6,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    color: colors.text,
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* PROBLEM */}
          <div
            style={{
              marginBottom: 28,
            }}
          >
            <h3
              style={{
                fontSize: 15,
                fontWeight: 800,
                marginBottom: 14,
                color: colors.text,

                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <MessageCircle size={18} />
              Problem Description
            </h3>

            <div
              style={{
                background: isDark
                  ? "rgba(2,6,23,0.5)"
                  : "#f8fafc",

                borderRadius: 20,

                padding: 22,

                border: `1px solid ${
                  isDark ? "rgba(255,255,255,0.04)" : "#e2e8f0"
                }`,
              }}
            >
              <p
                style={{
                  color: colors.text,
                  lineHeight: 1.8,
                  margin: 0,
                  fontSize: 15,
                }}
              >
                {ticket.problem}
              </p>
            </div>
          </div>

          {/* RESOLUTION */}
          {ticket.resolution && (
            <div
              style={{
                background: isDark
                  ? "rgba(16,185,129,0.08)"
                  : "#ecfdf5",

                borderRadius: 24,

                padding: 22,

                border: `1px solid ${
                  isDark
                    ? "rgba(16,185,129,0.18)"
                    : "#bbf7d0"
                }`,

                marginBottom: 28,
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  marginBottom: 12,
                  color: "#10b981",

                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <CheckCircle2 size={18} />
                Resolution
              </h3>

              <p
                style={{
                  color: isDark ? "#d1fae5" : "#166534",
                  margin: 0,
                  lineHeight: 1.8,
                  fontSize: 15,
                }}
              >
                {ticket.resolution}
              </p>
            </div>
          )}

          {/* BUTTON */}
          <button
            onClick={() => navigate(`/ticket/${ticket.id}`)}
            style={{
              width: "100%",

              background:
                "linear-gradient(135deg,#6366f1,#8b5cf6)",

              color: "#fff",

              padding: "16px 20px",

              borderRadius: 18,

              border: "none",

              fontWeight: 700,

              fontSize: 15,

              cursor: "pointer",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,

              boxShadow:
                "0 10px 30px rgba(99,102,241,0.35)",
            }}
          >
            <MessageCircle size={18} />
            Open Conversation
          </button>
        </div>
      </div>
    </div>
  );
}

  // Success screen
  if (success) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          background: isDark ? colors.bg : "#f8fafc",
          transition: "background-color 0.3s ease",
        }}
      >
        <div
          className="fade-up"
          style={{
            background: isDark ? colors.bgSecondary : "#fff",
            borderRadius: 20,
            padding: "48px 40px",
            textAlign: "center",
            maxWidth: 450,
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: `1px solid ${colors.border}`,
            transition: "background-color 0.3s ease",
          }}
        >
          <div
            style={{
              marginBottom: 16,
              animation: "bounce 0.6s ease",
            }}
          >
            <CheckCircle2 size={64} color="#10b981" strokeWidth={1.5} />
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 12,
              color: colors.text,
            }}
          >
            Ticket Submitted!
          </h2>
          <p
            style={{
              color: colors.textSecondary,
              marginBottom: 28,
              lineHeight: 1.6,
              fontSize: 14,
            }}
          >
            Your issue has been logged. The ICT team has been notified and will
            attend to your problem shortly.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => navigate("/my-tickets")}
              style={{
                flex: 1,
                padding: "13px",
                background: "#667eea",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Clipboard size={16} />
              View All Tickets
            </button>
            <button
              onClick={() => setSuccess(false)}
              style={{
                flex: 1,
                padding: "13px",
                background: isDark ? colors.bgSecondary : "#fff",
                color: "#667eea",
                border: "1.5px solid #667eea",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
              }}
            >
              <Plus size={16} />
              Submit Another
            </button>
          </div>
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
            radial-gradient(circle at bottom left, rgba(168,85,247,0.14), transparent 22%),
            radial-gradient(circle at center, rgba(59,130,246,0.08), transparent 30%),
            #020617
          `
          : `
            radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 26%),
            radial-gradient(circle at bottom left, rgba(168,85,247,0.08), transparent 22%),
            #f8fafc
          `,

        transition: "all 0.3s ease",
      }}
    >
      {/* STYLES */}
      <style>{`

        *{
          box-sizing:border-box;
        }

        @keyframes floatGlow {
          0% { transform: translateY(0px);}
          50% { transform: translateY(-8px);}
          100% { transform: translateY(0px);}
        }

        @keyframes pulseGlow {
          0% { opacity:0.5; }
          50% { opacity:1; }
          100% { opacity:0.5; }
        }

        @keyframes fadeUp {
          from{
            opacity:0;
            transform:translateY(18px);
          }
          to{
            opacity:1;
            transform:translateY(0px);
          }
        }

        .fade-up{
          animation:fadeUp 0.5s ease;
        }

        .hero-title{
          animation: floatGlow 5s ease-in-out infinite;
        }

        .hero-badge{
          animation:pulseGlow 4s ease infinite;
        }

        input:focus,
        select:focus,
        textarea:focus{
          outline:none;
          border-color:#6366f1 !important;
          box-shadow:0 0 0 4px rgba(99,102,241,0.14);
        }

        @media (max-width: 980px){

          .main-grid{
            grid-template-columns:1fr !important;
          }

          .hero-grid{
            align-items:flex-start !important;
          }

        }

        @media (max-width: 640px){

          .hero-card{
            height:auto !important;
            min-height:420px;
          }

          .form-grid{
            grid-template-columns:1fr !important;
          }

          .hero-title-text{
            font-size:1.9rem !important;
            line-height:1.2 !important;
          }

          .mobile-stack{
            flex-direction:column !important;
          }

          .mobile-full{
            width:100%;
          }

        }

      `}</style>

      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "18px",
        }}
      >
        {/* HERO */}
        <div
          className="hero-card"
          style={{
            position: "relative",
            overflow: "hidden",

            borderRadius: 36,

            minHeight: 320,

            marginBottom: 28,

            boxShadow:
              "0 25px 60px rgba(0,0,0,0.25)",
          }}
        >
          {/* IMAGE */}
          <img
            src="/bg.png"
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.55)",
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
                  rgba(2,6,23,0.82),
                  rgba(79,70,229,0.55),
                  rgba(15,23,42,0.72)
                )
              `,
            }}
          />

          {/* LIGHTNING EFFECTS */}
          <div
            style={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.35)",
              filter: "blur(120px)",
              top: -80,
              right: -60,
              animation:
                "pulseGlow 4s ease infinite",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: "rgba(168,85,247,0.28)",
              filter: "blur(100px)",
              bottom: -60,
              left: -40,
              animation:
                "pulseGlow 5s ease infinite",
            }}
          />

          {/* CONTENT */}
          <div
            className="hero-grid"
            style={{
              position: "relative",
              zIndex: 2,

              display: "flex",
              flexDirection: "column",
              justifyContent: "center",

              height: "100%",

              padding: "clamp(24px,4vw,42px)",

              color: "#fff",
            }}
          >
            {/* ICON */}
            <div
              className="hero-badge"
              style={{
                width: 82,
                height: 82,
                borderRadius: 24,

                background:
                  "rgba(255,255,255,0.12)",

                backdropFilter: "blur(14px)",

                border:
                  "1px solid rgba(255,255,255,0.14)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                marginBottom: 24,

                boxShadow:
                  "0 15px 40px rgba(0,0,0,0.25)",
              }}
            >
              <Wrench
                size={40}
                color="#fff"
                strokeWidth={1.8}
              />
            </div>

            {/* TITLE */}
            <h1
              className="hero-title hero-title-text"
              style={{
                fontSize: "clamp(2.3rem,5vw,4rem)",
                fontWeight: 900,
                lineHeight: 1.05,
                marginBottom: 18,
                maxWidth: 850,
                letterSpacing: "-0.04em",
              }}
            >
              Ministry of Basic &
              <br />

              <span
                style={{
                  background:
                    "linear-gradient(90deg,#c4b5fd,#ffffff,#93c5fd)",

                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor:
                    "transparent",

                  textShadow:
                    "0 0 25px rgba(255,255,255,0.12)",
                }}
              >
                Secondary Education
                <br />
                ICT Unit Help Desk
              </span>
            </h1>

            {/* SUBTEXT */}
            <p
              style={{
                maxWidth: 700,
                fontSize: "clamp(14px,2vw,17px)",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.86)",
                marginBottom: 26,
              }}
            >
              Submit technical issues, track
              support progress, and communicate
              directly with the ICT support team
              in real-time.
            </p>

            {/* BADGES */}
            <div
              className="mobile-stack"
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {[
                "Fast Response",
                "Real-time Updates",
                "Live Ticket Chat",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 999,

                    background:
                      "rgba(255,255,255,0.1)",

                    backdropFilter: "blur(12px)",

                    border:
                      "1px solid rgba(255,255,255,0.14)",

                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div
          className="main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* FORM CARD */}
          <div
            className="fade-up"
            style={{
              background: isDark
                ? "rgba(15,23,42,0.78)"
                : "rgba(255,255,255,0.92)",

              backdropFilter: "blur(18px)",

              borderRadius: 30,

              padding: "clamp(20px,3vw,34px)",

              border: `1px solid ${
                isDark
                  ? "rgba(255,255,255,0.06)"
                  : "#e2e8f0"
              }`,

              boxShadow: isDark
                ? "0 25px 60px rgba(0,0,0,0.35)"
                : "0 20px 45px rgba(15,23,42,0.06)",
            }}
          >
            {/* NAME */}
            <div style={{ marginBottom: 22 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 10,
                  color: colors.text,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Full Name
              </label>

              <input
                type="text"
                value={form.name}
                placeholder="e.g. Amina Yusuf"
                onChange={(e) =>
                  update("name", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "15px 16px",
                  borderRadius: 16,
                  border: `1.5px solid ${
                    errors.name
                      ? "#ef4444"
                      : colors.border
                  }`,

                  background: isDark
                    ? "rgb(15,23,42)"
                    : "#fff",

                  color: colors.text,
                  fontSize: 14,
                }}
              />

              {errors.name && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: 12,
                    marginTop: 6,
                  }}
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* GRID */}
            <div
              className="form-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18,
                marginBottom: 22,
              }}
            >
              {/* Department */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 10,
                    color: colors.text,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Department
                </label>

                <select
                  value={form.department}
                  onChange={(e) =>
                    update(
                      "department",
                      e.target.value,
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "15px 16px",
                    borderRadius: 16,
                    border: `1.5px solid ${
                      errors.department
                        ? "#ef4444"
                        : colors.border
                    }`,
                    background: isDark
                      ? "rgb(15,23,42)"
                      : "#fff",
                    color: colors.text,
                    fontSize: 14,
                  }}
                >
                  <option value="">
                    Select department
                  </option>

                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 10,
                    color: colors.text,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Room / Location
                </label>

                <input
                  type="text"
                  value={form.location}
                  placeholder="e.g. Room 204"
                  onChange={(e) =>
                    update(
                      "location",
                      e.target.value,
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "15px 16px",
                    borderRadius: 16,
                    border: `1.5px solid ${
                      errors.location
                        ? "#ef4444"
                        : colors.border
                    }`,
                    background: isDark
                      ? "rgb(15,23,42)"
                      : "#fff",
                    color: colors.text,
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            {/* PROBLEM */}
            <div style={{ marginBottom: 22 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 10,
                  color: colors.text,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Describe the Problem
              </label>

              <textarea
                rows={5}
                value={form.problem}
                placeholder="Explain the issue clearly..."
                onChange={(e) =>
                  update("problem", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "15px 16px",
                  borderRadius: 16,
                  border: `1.5px solid ${
                    errors.problem
                      ? "#ef4444"
                      : colors.border
                  }`,
                  background: isDark
                    ? "rgb(15,23,42)"
                    : "#fff",
                  color: colors.text,
                  resize: "vertical",
                  fontSize: 14,
                }}
              />

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: colors.textSecondary,
                }}
              >
                {form.problem.length} characters
              </div>
            </div>

            {/* PRIORITY */}
            <div style={{ marginBottom: 26 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 12,
                  color: colors.text,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Priority Level
              </label>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {PRIORITIES.map((p) => {
                  const active =
                    form.priority === p.value;

                  return (
                    <label
                      key={p.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,

                        padding: "16px",

                        borderRadius: 18,

                        border: `2px solid ${
                          active
                            ? p.color
                            : colors.border
                        }`,

                        background: active
                          ? p.color + "15"
                          : isDark
                            ? "rgba(255,255,255,0.03)"
                            : "#fff",

                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        checked={active}
                        onChange={() =>
                          update(
                            "priority",
                            p.value,
                          )
                        }
                      />

                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: p.color,
                        }}
                      />

                      <span
                        style={{
                          color: colors.text,
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {p.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* SUBMIT */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",

                padding: "17px 18px",

                borderRadius: 18,

                border: "none",

                background:
                  "linear-gradient(135deg,#6366f1,#8b5cf6)",

                color: "#fff",

                fontSize: 15,
                fontWeight: 800,

                cursor: loading
                  ? "not-allowed"
                  : "pointer",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,

                boxShadow:
                  "0 15px 30px rgba(99,102,241,0.3)",
              }}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    style={{
                      animation:
                        "spin 1s linear infinite",
                    }}
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Ticket
                </>
              )}
            </button>

            {/* TIP */}
            <div
              style={{
                marginTop: 22,

                padding: 18,

                borderRadius: 18,

                background: isDark
                  ? "rgba(255,255,255,0.03)"
                  : "#eef2ff",

                border: `1px solid ${
                  isDark
                    ? "rgba(255,255,255,0.05)"
                    : "#c7d2fe"
                }`,

                display: "flex",
                gap: 12,
                alignItems: "flex-start",

                color: isDark
                  ? colors.textSecondary
                  : "#1e40af",

                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              <Lightbulb
                size={18}
                style={{ flexShrink: 0 }}
              />

              <div>
                <strong>Tip:</strong> Include
                screenshots, exact error messages,
                or what you were doing before the
                issue happened for faster support.
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <PastTicketsPanel
            tickets={pastTickets}
            onSelectTicket={
              setSelectedTicketId
            }
          />
        </div>
      </div>
    </div>
  );
}