import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { agentLogin } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Wrench,
  AlertTriangle,
  Loader2,
  Lock,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function AgentLogin() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const { isDark, colors } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      setError("Both fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await agentLogin(form);

      login(
        {
          id: res.data.id,
          name: res.data.name,
          username: res.data.username,
          role: "agent",
        },
        res.data.token,
      );

      navigate("/agent");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 3vw, 30px)",

        background: isDark
          ? `
            radial-gradient(circle at top right, rgba(99,102,241,0.16), transparent 24%),
            radial-gradient(circle at bottom left, rgba(168,85,247,0.12), transparent 24%),
            linear-gradient(180deg,#020617,#0f172a)
          `
          : `
            radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 24%),
            linear-gradient(180deg,#f8fafc,#eef2ff)
          `,
      }}
    >
      {/* BACKGROUND GLOWS */}
      <div
        style={{
          position: "absolute",
          width: 460,
          height: 460,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.22)",
          filter: "blur(130px)",
          top: -120,
          right: -100,
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "rgba(168,85,247,0.18)",
          filter: "blur(110px)",
          bottom: -80,
          left: -60,
        }}
      />

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes pulseGlow {
          0% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
          100% { opacity: 0.7; transform: scale(1); }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .agent-input:focus {
          outline: none;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.12);
        }

        .agent-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 50px rgba(99,102,241,0.35);
        }

        .feature-pill:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.16) !important;
        }

        @media (max-width: 1024px) {
          .agent-layout {
            grid-template-columns: 1fr !important;
          }

          .hero-side {
            min-height: 420px !important;
          }
        }

        @media (max-width: 768px) {
          .hero-side {
            display: none !important;
          }

          .form-side {
            padding: 34px 24px !important;
          }
        }
      `}</style>

      <div
        className="agent-layout"
        style={{
          width: "100%",
          maxWidth: 1180,

          display: "grid",
          gridTemplateColumns: "1fr 480px",

          overflow: "hidden",

          borderRadius: 36,

          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,

          background: isDark ? "rgba(15,23,42,0.76)" : "rgba(255,255,255,0.92)",

          backdropFilter: "blur(20px)",

          boxShadow: isDark
            ? "0 40px 100px rgba(0,0,0,0.55)"
            : "0 30px 80px rgba(0,0,0,0.12)",

          position: "relative",
          zIndex: 10,
        }}
      >
        {/* LEFT SIDE */}
        <div
          className="hero-side"
          style={{
            position: "relative",
            minHeight: 760,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* IMAGE */}
          <img
            src="/IT (2).jpg"
            alt="IT Support"
            style={{
              position: "absolute",
              inset: 0,

              width: "100%",
              height: "100%",

              objectFit: "cover",

              filter: "brightness(0.58)",

              transform: "scale(1.05)",
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
                  rgba(2,6,23,0.92) 0%,
                  rgba(79,70,229,0.70) 45%,
                  rgba(15,23,42,0.88) 100%
                )
              `,
            }}
          />

          {/* EXTRA GLOW */}
          <div
            style={{
              position: "absolute",
              width: 340,
              height: 340,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.30)",
              filter: "blur(90px)",
              top: -50,
              right: -60,
              animation: "pulseGlow 5s ease-in-out infinite",
            }}
          />

          {/* CONTENT */}
          <div
            style={{
              position: "relative",
              zIndex: 2,

              padding: "clamp(32px,5vw,60px)",

              color: "#fff",
            }}
          >
            {/* ICON */}
            <div
              style={{
                width: 90,
                height: 90,

                borderRadius: 28,

                background: "rgba(255,255,255,0.12)",

                backdropFilter: "blur(14px)",

                border: "1px solid rgba(255,255,255,0.14)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                marginBottom: 30,

                animation: "float 4s ease-in-out infinite",
              }}
            >
              <ShieldCheck size={42} color="#fff" />
            </div>

            {/* TITLE */}
            <h1
              style={{
                fontSize: "clamp(2.4rem,4vw,4.2rem)",

                fontWeight: 900,

                lineHeight: 1.02,

                marginBottom: 18,

                maxWidth: 560,

                letterSpacing: "-0.05em",
              }}
            >
              Agent Support
              <span
                style={{
                  display: "block",

                  background: "linear-gradient(90deg,#c4b5fd,#ffffff)",

                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Control Hub
              </span>
            </h1>

            {/* TEXT */}
            <p
              style={{
                fontSize: 16,

                lineHeight: 1.9,

                color: "rgba(255,255,255,0.84)",

                maxWidth: 540,

                marginBottom: 34,
              }}
            >
              Access your support dashboard to manage assigned tickets, monitor
              issue progress, respond faster, and keep your organization’s IT
              operations running smoothly.
            </p>

            {/* FEATURES */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                marginBottom: 34,
              }}
            >
              {[
                "Real-Time Support",
                "Ticket Tracking",
                "Secure Access",
                "Fast Workflow",
              ].map((item) => (
                <div
                  key={item}
                  className="feature-pill"
                  style={{
                    padding: "12px 18px",

                    borderRadius: 999,

                    background: "rgba(255,255,255,0.10)",

                    border: "1px solid rgba(255,255,255,0.12)",

                    backdropFilter: "blur(10px)",

                    color: "#fff",

                    fontSize: 13,
                    fontWeight: 700,

                    transition: "0.25s",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Fast Response",
                  value: "24/7",
                },
                {
                  label: "Secure Access",
                  value: "100%",
                },
                {
                  label: "Workflow",
                  value: "Smart",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "rgba(255,255,255,0.08)",

                    border: "1px solid rgba(255,255,255,0.10)",

                    borderRadius: 22,

                    padding: 18,

                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      marginBottom: 4,
                    }}
                  >
                    {item.value}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.74)",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="form-side"
          style={{
            padding: "clamp(34px,4vw,54px)",

            display: "flex",
            flexDirection: "column",
            justifyContent: "center",

            background: isDark
              ? "rgba(15,23,42,0.92)"
              : "rgba(255,255,255,0.96)",
          }}
        >
          {/* HEADER */}
          <div style={{ marginBottom: 34 }}>
            <div
              style={{
                width: 78,
                height: 78,

                borderRadius: 24,

                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                marginBottom: 22,

                boxShadow: "0 20px 40px rgba(99,102,241,0.30)",
              }}
            >
              <Wrench size={36} color="#fff" />
            </div>

            <h2
              style={{
                fontSize: "clamp(2rem,3vw,2.5rem)",

                fontWeight: 900,

                color: colors.text,

                marginBottom: 10,

                letterSpacing: "-0.04em",
              }}
            >
              Welcome Back
            </h2>

            <p
              style={{
                color: colors.textSecondary,

                lineHeight: 1.8,

                fontSize: 15,
              }}
            >
              Sign in to access your assigned support dashboard and manage IT
              support tickets efficiently.
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            {/* USERNAME */}
            <div>
              <label
                style={{
                  display: "block",

                  marginBottom: 10,

                  fontSize: 12,
                  fontWeight: 700,

                  color: colors.text,

                  textTransform: "uppercase",

                  letterSpacing: "0.08em",
                }}
              >
                Username
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  disabled={loading}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      username: e.target.value,
                    }))
                  }
                  className="agent-input"
                  style={{
                    width: "100%",

                    padding: "16px 18px",

                    borderRadius: 18,

                    border: `1.5px solid ${colors.border}`,

                    background: isDark ? "rgba(2,6,23,0.75)" : "#ffffff",

                    color: colors.text,

                    fontSize: 14,

                    transition: "all 0.25s ease",
                  }}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                style={{
                  display: "block",

                  marginBottom: 10,

                  fontSize: 12,
                  fontWeight: 700,

                  color: colors.text,

                  textTransform: "uppercase",

                  letterSpacing: "0.08em",
                }}
              >
                Password
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  disabled={loading}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      password: e.target.value,
                    }))
                  }
                  className="agent-input"
                  style={{
                    width: "100%",

                    padding: "16px 18px",

                    borderRadius: 18,

                    border: `1.5px solid ${colors.border}`,

                    background: isDark ? "rgba(2,6,23,0.75)" : "#ffffff",

                    color: colors.text,

                    fontSize: 14,

                    transition: "all 0.25s ease",
                  }}
                />
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.12)",

                  border: "1px solid rgba(239,68,68,0.25)",

                  color: "#fca5a5",

                  padding: 15,

                  borderRadius: 18,

                  display: "flex",
                  alignItems: "center",
                  gap: 10,

                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="agent-btn"
              style={{
                width: "100%",

                padding: 17,

                borderRadius: 20,

                border: "none",

                background: loading
                  ? "#475569"
                  : "linear-gradient(135deg,#6366f1,#8b5cf6)",

                color: "#fff",

                fontWeight: 800,

                fontSize: 15,

                cursor: loading ? "not-allowed" : "pointer",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                gap: 10,

                transition: "all 0.25s ease",

                boxShadow: "0 20px 40px rgba(99,102,241,0.30)",
              }}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    style={{
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Signing In...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* FOOTER CARD */}
          <div
            style={{
              marginTop: 26,

              padding: 20,

              borderRadius: 22,

              background: isDark ? "rgba(30,41,59,0.70)" : "#eef2ff",

              border: `1px solid ${
                isDark ? "rgba(255,255,255,0.06)" : "#c7d2fe"
              }`,

              display: "flex",
              gap: 12,

              alignItems: "flex-start",

              color: colors.textSecondary,

              lineHeight: 1.7,

              fontSize: 13,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,

                borderRadius: 12,

                background: isDark ? "rgba(99,102,241,0.18)" : "#dbeafe",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                flexShrink: 0,
              }}
            >
              <FileText size={16} />
            </div>

            <div>
              <strong
                style={{
                  display: "block",
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                Agent Credentials
              </strong>
              Contact your system administrator to receive your assigned
              username and password credentials for secure dashboard access.
            </div>
          </div>

          {/* SECURITY NOTE */}
          <div
            style={{
              marginTop: 18,

              display: "flex",
              alignItems: "center",
              gap: 10,

              color: colors.textSecondary,

              fontSize: 12,
            }}
          >
            <Sparkles size={14} />
            Protected access with secure authentication system
          </div>
        </div>
      </div>
    </div>
  );
}
