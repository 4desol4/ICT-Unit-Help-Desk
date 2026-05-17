import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import {
  Crown,
  AlertTriangle,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Settings,
  Sparkles,
  Activity,
  MonitorSmartphone,
} from "lucide-react";

export default function AdminLogin() {
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
      const res = await adminLogin(form);

      login(
        {
          username: res.data.username,
          role: "admin",
        },
        res.data.token,
      );

      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
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
        padding: "clamp(12px,3vw,24px)",

        background: isDark
          ? `
            radial-gradient(circle at top right, rgba(99,102,241,0.18), transparent 24%),
            radial-gradient(circle at bottom left, rgba(168,85,247,0.14), transparent 26%),
            radial-gradient(circle at center, rgba(59,130,246,0.08), transparent 35%),
            #020617
          `
          : `
            radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 24%),
            radial-gradient(circle at bottom left, rgba(168,85,247,0.08), transparent 24%),
            #f8fafc
          `,
      }}
    >
      {/* Animated Background Lights */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.22)",
          filter: "blur(130px)",
          top: -180,
          right: -120,
          animation: "floatGlow 10s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "rgba(168,85,247,0.16)",
          filter: "blur(120px)",
          bottom: -120,
          left: -100,
          animation: "floatGlow 12s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(59,130,246,0.14)",
          filter: "blur(100px)",
          top: "40%",
          left: "40%",
        }}
      />

      <style>{`
        * {
          box-sizing: border-box;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes pulseGlow {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }

        @keyframes floatGlow {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
          100% { transform: translateY(0px) translateX(0px); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        .fade-up {
          animation: fadeUp 0.6s ease;
        }

        .admin-input:focus {
          outline: none;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.12);
        }

        .admin-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 45px rgba(99,102,241,0.4) !important;
        }

        .feature-pill:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.16) !important;
        }

        @media (max-width: 980px) {
          .admin-wrapper {
            grid-template-columns: 1fr !important;
          }

          .admin-left {
            min-height: 360px !important;
          }
        }

        @media (max-width: 640px) {
          .admin-card {
            border-radius: 24px !important;
          }

          .admin-left {
            min-height: 320px !important;
          }

          .admin-left-content {
            padding: 28px !important;
          }

          .admin-right {
            padding: 28px 20px !important;
          }

          .admin-title {
            font-size: 2.3rem !important;
          }

          .admin-form-title {
            font-size: 2rem !important;
          }

          .feature-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .feature-pill {
            justify-content: center;
          }
        }
      `}</style>

      {/* MAIN CONTAINER */}
      <div
        className="admin-wrapper admin-card fade-up"
        style={{
          width: "100%",
          maxWidth: 1200,
          display: "grid",
          gridTemplateColumns: "1fr 470px",
          overflow: "hidden",
          borderRadius: 34,

          border: `1px solid ${
            isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"
          }`,

          background: isDark
            ? "rgba(15,23,42,0.76)"
            : "rgba(255,255,255,0.94)",

          backdropFilter: "blur(18px)",

          boxShadow: isDark
            ? "0 30px 80px rgba(0,0,0,0.4)"
            : "0 25px 70px rgba(15,23,42,0.12)",

          position: "relative",
          zIndex: 10,
        }}
      >
        {/* LEFT SIDE */}
        <div
          className="admin-left"
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
            src="/IT (8).jpg"
            alt="Admin Dashboard"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
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
                  rgba(2,6,23,0.88) 0%,
                  rgba(79,70,229,0.58) 42%,
                  rgba(15,23,42,0.82) 100%
                )
              `,
            }}
          />

          {/* Decorative Glow */}
          <div
            style={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.3)",
              filter: "blur(90px)",
              top: -40,
              right: -60,
            }}
          />

          {/* Floating Dot */}
          <div
            style={{
              position: "absolute",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#fff",
              top: "18%",
              right: "20%",
              animation: "pulseGlow 3s ease infinite",
            }}
          />

          {/* CONTENT */}
          <div
            className="admin-left-content"
            style={{
              position: "relative",
              zIndex: 2,
              padding: 52,
              color: "#fff",
            }}
          >
            {/* Floating Icon */}
            <div
              style={{
                width: 86,
                height: 86,
                borderRadius: 30,
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.14)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                marginBottom: 30,

                animation: "float 4s ease-in-out infinite",

                boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              }}
            >
              <ShieldCheck size={42} color="#fff" />
            </div>

            {/* Small Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 999,

                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.12)",

                backdropFilter: "blur(10px)",

                fontSize: 12,
                fontWeight: 700,

                marginBottom: 24,
              }}
            >
              <Sparkles size={14} />
              Secure Administrative Access
            </div>

            {/* HEADING */}
            <h1
              className="admin-title"
              style={{
                fontSize: "clamp(2.6rem, 5vw, 4.5rem)",
                fontWeight: 900,
                lineHeight: 1.02,
                marginBottom: 20,
                maxWidth: 560,
                letterSpacing: "-0.05em",
              }}
            >
              Administrative
              <span
                style={{
                  display: "block",

                  background:
                    "linear-gradient(90deg,#c4b5fd,#ffffff,#93c5fd)",

                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",

                  animation: "pulseGlow 4s ease infinite",
                }}
              >
                Control Center
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.9,
                color: "rgba(255,255,255,0.84)",
                maxWidth: 520,
                marginBottom: 34,
              }}
            >
              Access the administration dashboard to manage users,
              oversee support operations, monitor tickets,
              supervise agents, and control the ICT support ecosystem
              securely in real time.
            </p>

            {/* Feature Pills */}
            <div
              className="feature-row"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
              }}
            >
              {[
                {
                  icon: Settings,
                  text: "System Control",
                },
                {
                  icon: MonitorSmartphone,
                  text: "Manage Agents",
                },
                {
                  icon: ShieldCheck,
                  text: "Secure Access",
                },
                {
                  icon: Activity,
                  text: "Analytics",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="feature-pill"
                    style={{
                      padding: "13px 18px",
                      borderRadius: 999,

                      background: "rgba(255,255,255,0.1)",

                      border:
                        "1px solid rgba(255,255,255,0.12)",

                      backdropFilter: "blur(10px)",

                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,

                      display: "flex",
                      alignItems: "center",
                      gap: 8,

                      transition: "all 0.25s ease",
                    }}
                  >
                    <Icon size={15} />
                    {item.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="admin-right"
          style={{
            padding: "52px 42px",

            display: "flex",
            flexDirection: "column",
            justifyContent: "center",

            background: isDark
              ? "rgba(15,23,42,0.94)"
              : "rgba(255,255,255,0.98)",

            position: "relative",
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: "absolute",
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.08)",
              filter: "blur(80px)",
              top: -50,
              right: -60,
            }}
          />

          {/* TOP ICON */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              marginBottom: 34,
            }}
          >
            <div
              style={{
                width: 78,
                height: 78,
                borderRadius: 26,

                background:
                  "linear-gradient(135deg,#6366f1,#8b5cf6)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                marginBottom: 24,

                boxShadow:
                  "0 20px 40px rgba(99,102,241,0.32)",
              }}
            >
              <Crown size={38} color="#fff" />
            </div>

            <h2
              className="admin-form-title"
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: colors.text,
                marginBottom: 10,
                letterSpacing: "-0.04em",
              }}
            >
              Admin Portal
            </h2>

            <p
              style={{
                color: colors.textSecondary,
                lineHeight: 1.8,
                fontSize: 15,
                maxWidth: 420,
              }}
            >
              Sign in to manage the ICT support system and
              administrative operations securely.
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            style={{
              position: "relative",
              zIndex: 2,

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
                  fontWeight: 800,

                  color: colors.text,

                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Username
              </label>

              <div style={{ position: "relative" }}>
                <Mail
                  size={18}
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: colors.textSecondary,
                  }}
                />

                <input
                  className="admin-input"
                  type="text"
                  placeholder="Enter admin username"
                  value={form.username}
                  disabled={loading}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      username: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "16px 18px 16px 50px",

                    borderRadius: 18,

                    border: `1.5px solid ${colors.border}`,

                    background: isDark
                      ? "rgba(15,23,42,0.85)"
                      : "#ffffff",

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
                  fontWeight: 800,

                  color: colors.text,

                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Password
              </label>

              <div style={{ position: "relative" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: colors.textSecondary,
                  }}
                />

                <input
                  className="admin-input"
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  disabled={loading}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      password: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "16px 18px 16px 50px",

                    borderRadius: 18,

                    border: `1.5px solid ${colors.border}`,

                    background: isDark
                      ? "rgba(15,23,42,0.85)"
                      : "#ffffff",

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

                  border:
                    "1px solid rgba(239,68,68,0.25)",

                  color: isDark ? "#fca5a5" : "#b91c1c",

                  padding: 14,
                  borderRadius: 16,

                  display: "flex",
                  alignItems: "center",
                  gap: 10,

                  fontSize: 14,
                  fontWeight: 600,
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
              className="admin-btn"
              style={{
                width: "100%",
                padding: 17,

                borderRadius: 18,
                border: "none",

                background: loading
                  ? "#475569"
                  : "linear-gradient(135deg,#6366f1,#8b5cf6)",

                color: "#fff",

                fontWeight: 800,
                fontSize: 15,

                cursor: loading
                  ? "not-allowed"
                  : "pointer",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,

                transition: "all 0.25s ease",

                boxShadow:
                  "0 20px 40px rgba(99,102,241,0.3)",
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
                  Signing In...
                </>
              ) : (
                <>
                  <Settings size={18} />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div
            style={{
              position: "relative",
              zIndex: 2,

              marginTop: 24,

              padding: 18,

              borderRadius: 18,

              background: isDark
                ? "rgba(30,41,59,0.65)"
                : "#eef2ff",

              border: `1px solid ${
                isDark
                  ? "rgba(255,255,255,0.05)"
                  : "#c7d2fe"
              }`,

              display: "flex",
              gap: 10,
              alignItems: "flex-start",

              color: colors.textSecondary,

              lineHeight: 1.7,
              fontSize: 13,
            }}
          >
            <ShieldCheck
              size={16}
              style={{
                marginTop: 2,
                flexShrink: 0,
              }}
            />

            <div>
              <strong>Secure Access:</strong> This portal
              is restricted to authorized administrators
              only. All login activities are monitored and
              protected.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}