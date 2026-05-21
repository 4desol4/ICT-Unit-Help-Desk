import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userLogin } from "../api";
import {
  Users,
  AlertTriangle,
  Loader2,
  Hash,
  Zap,
  Clock,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function UserLogin() {
  const [form, setForm] = useState({
    oracleNumber: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const { isDark, colors } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.oracleNumber || form.oracleNumber.trim().length === 0) {
      setError("Oracle number is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await userLogin(form);
      const userData = response.data || response;

      login(
        {
          id: userData.id,
          oracleNumber: userData.oracleNumber,
          role: "user",
        },
        userData.token,
      );

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
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
        padding: "clamp(14px,3vw,28px)",
        background: isDark
          ? `
            radial-gradient(circle at top right, rgba(99,102,241,0.20), transparent 28%),
            radial-gradient(circle at bottom left, rgba(59,130,246,0.14), transparent 26%),
            radial-gradient(circle at center, rgba(168,85,247,0.10), transparent 38%),
            #020617
          `
          : `
            radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 24%),
            radial-gradient(circle at bottom left, rgba(59,130,246,0.08), transparent 22%),
            #f8fafc
          `,
      }}
    >
      {/* Animated Background Glow */}
      <div
        style={{
          position: "absolute",
          width: "40vw",
          height: "40vw",
          minWidth: 260,
          minHeight: 260,
          maxWidth: 520,
          maxHeight: 520,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.22)",
          filter: "blur(120px)",
          top: -120,
          right: -100,
          animation: "floatGlow 8s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "32vw",
          height: "32vw",
          minWidth: 220,
          minHeight: 220,
          maxWidth: 420,
          maxHeight: 420,
          borderRadius: "50%",
          background: "rgba(59,130,246,0.16)",
          filter: "blur(100px)",
          bottom: -100,
          left: -60,
          animation: "floatGlow2 10s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes floatGlow {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(-8px); }
          100% { transform: translateY(0px) translateX(0px); }
        }

        @keyframes floatGlow2 {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(12px) translateX(10px); }
          100% { transform: translateY(0px) translateX(0px); }
        }

        @keyframes pulseBorder {
          0% { box-shadow: 0 0 0 rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 30px rgba(99,102,241,0.18); }
          100% { box-shadow: 0 0 0 rgba(99,102,241,0.2); }
        }

        input:focus {
          outline: none;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.12);
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 25px 50px rgba(99,102,241,0.38);
        }

        .feature-pill:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.16);
        }

        @media (max-width: 980px) {
          .login-grid {
            grid-template-columns: 1fr !important;
          }

          .left-panel {
            min-height: 320px !important;
          }
        }

        @media (max-width: 640px) {
     
          .welcome-title {
            font-size: 2rem !important;
          }

          .feature-row {
            gap: 10px !important;
          }

          .feature-pill {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div
        className="main-card login-grid"
        style={{
          width: "100%",
          maxWidth: 1180,
          display: "grid",
          gridTemplateColumns: "1fr 460px",
          overflow: "hidden",
          borderRadius: 34,
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
          background: isDark ? "rgba(15,23,42,0.78)" : "rgba(255,255,255,0.94)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.18)",
          position: "relative",
          zIndex: 10,
          animation: "pulseBorder 6s ease infinite",
        }}
      >
        {/* LEFT SECTION */}

        <div
          className="left-panel"
          style={{
            position: "relative",
            minHeight: 720,
            overflow: "hidden",
            background: "#020617",
          }}
        >
          {/* IMAGE */}
          <img
            src="/bg.png"
            alt="ICT Support"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              filter: `
        brightness(1.02)
        contrast(1.08)
        saturate(1.08)
      `,
              transform: "scale(1.02)",
            }}
          />

         
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `
        linear-gradient(
          135deg,
          rgba(2,6,23,0.42) 0%,
          rgba(2,6,23,0.28) 40%,
          rgba(2,6,23,0.20) 100%
        )
      `,
              zIndex: 1,
            }}
          />

          {/* BOTTOM OVERLAY */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `
        linear-gradient(
          to top,
          rgba(2,6,23,0.58) 0%,
          rgba(2,6,23,0.35) 35%,
          transparent 65%
        )
      `,
              zIndex: 1,
            }}
          />

          {/* GLOW EFFECT */}
          <div
            style={{
              position: "absolute",
              width: 340,
              height: 340,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.22)",
              filter: "blur(120px)",
              top: -80,
              right: -100,
              zIndex: 1,
            }}
          />

          {/* CONTENT */}
          <div
            className="left-content"
            style={{
              position: "absolute",
              inset: 0,

              zIndex: 5,

              display: "flex",
              flexDirection: "column",

              alignItems: "center",
              justifyContent: "center",

              textAlign: "center",

              width: "100%",
              height: "100%",

              padding: "50px",

              color: "#fff",
            }}
          >
            {/* ICON */}
            <div
              style={{
                width: 82,
                height: 82,
                borderRadius: 26,
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 28,
                boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
                animation: "float 4s ease-in-out infinite",
              }}
            >
              <Users size={40} color="#fff" />
            </div>

            {/* TITLE */}
            <h1
              className="hero-title"
              style={{
                fontSize: "clamp(2.8rem,4vw,4.5rem)",
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: 18,
                letterSpacing: "-0.05em",
                textAlign: "center",
                textShadow: "0 8px 30px rgba(0,0,0,0.45)",
              }}
            >
              MBSE ICT Unit
              <span
                style={{
                  display: "block",
                  marginTop: 8,
                  background: "linear-gradient(90deg,#a5f3fc,#86efac,#ffffff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Help Desk
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.92)",
                maxWidth: 520,
                marginBottom: 30,
                textAlign: "center",
                textShadow: "0 3px 14px rgba(0,0,0,0.45)",
              }}
            >
              Submit technical complaints, track support tickets in real-time,
              and communicate directly with the ICT support team securely and
              efficiently.
            </p>

            {/* FEATURE PILLS */}
            <div
              className="feature-row"
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: 14,
              }}
            >
              {[
                { icon: Zap, text: "Fast Support" },
                { icon: Clock, text: "24/7 Assistance" },
                { icon: ShieldCheck, text: "Secure Access" },
              ].map((item, idx) => {
                const Icon = item.icon;

                return (
                  <div
                    key={idx}
                    className="feature-pill"
                    style={{
                      padding: "12px 18px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      backdropFilter: "blur(12px)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 8px 25px rgba(0,0,0,0.18)",
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

        {/* RESPONSIVENESS */}
        <style>{`
@media (max-width: 980px) {
  .login-grid {
    grid-template-columns: 1fr !important;
  }

  .left-panel {
    min-height: 460px !important;
  }
}

@media (max-width: 640px) {
  .main-card {
    border-radius: 22px !important;
    overflow: hidden !important;
  }

  /* HERO SECTION */
  .left-panel {
    min-height: 380px !important;
    height: 380px !important;
    max-height: 380px !important;

    position: relative !important;
    overflow: hidden !important;
  }

  /* IMAGE */
  .left-panel img {
    width: 100% !important;
    height: 100% !important;

    object-fit: cover !important;

    object-position: center top !important;

    transform: scale(1.02) !important;
  }

  /* CENTERED CONTENT */
  .left-content {
    position: absolute !important;
    inset: 0 !important;

    width: 100% !important;
    height: 100% !important;

    display: flex !important;
    flex-direction: column !important;

    align-items: center !important;
    justify-content: center !important;

    text-align: center !important;

    padding: 22px !important;

    z-index: 10 !important;
  }

  /* ICON */
  .left-content > div:first-child {
    width: 58px !important;
    height: 58px !important;

    border-radius: 18px !important;

    margin-bottom: 14px !important;
  }

  .left-content > div:first-child svg {
    width: 28px !important;
    height: 28px !important;
  }

  /* TITLE */
  .hero-title {
    font-size: 1.85rem !important;
    line-height: 1.05 !important;

    margin-bottom: 12px !important;

    text-align: center !important;
  }

  /* DESCRIPTION */
  .left-content p {
    font-size: 12px !important;
    line-height: 1.55 !important;

    max-width: 290px !important;

    margin-bottom: 16px !important;

    text-align: center !important;
  }

  /* FEATURES */
  .feature-row {
    justify-content: center !important;

    gap: 8px !important;
  }

  .feature-pill {
    width: auto !important;

    padding: 8px 12px !important;

    font-size: 11px !important;
  }

  .feature-pill svg {
    width: 12px !important;
    height: 12px !important;
  }

  /* RIGHT PANEL */
  .right-content {
    padding: 24px !important;
  }

  .welcome-title {
    font-size: 1.8rem !important;
    line-height: 1.08 !important;
  }
}
`}</style>

        {/* RIGHT LOGIN PANEL */}
        <div
          className="right-content"
          style={{
            padding: "50px 42px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: isDark
              ? "rgba(15,23,42,0.94)"
              : "rgba(255,255,255,0.96)",
          }}
        >
          {/* HEADER */}
          <div style={{ marginBottom: 34 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 24,
                background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 22,
                boxShadow: "0 20px 40px rgba(99,102,241,0.3)",
              }}
            >
              <Users size={36} color="#fff" />
            </div>

            <h2
              className="welcome-title"
              style={{
                fontSize: "clamp(2rem,3vw,2.5rem)",
                fontWeight: 800,
                color: colors.text,
                marginBottom: 10,
                letterSpacing: "-0.03em",
              }}
            >
              Welcome Back
            </h2>

            <p
              style={{
                color: colors.textSecondary,
                lineHeight: 1.7,
                fontSize: 15,
              }}
            >
              Sign in with your Oracle number to access your support dashboard.
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
            {/* INPUT */}
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
                Oracle Number
              </label>

              <input
                type="text"
                placeholder="e.g. EMP12345"
                value={form.oracleNumber}
                disabled={loading}
                onChange={(e) => {
                  setForm((p) => ({
                    ...p,
                    oracleNumber: e.target.value,
                  }));
                  setError("");
                }}
                style={{
                  width: "100%",
                  padding: "16px 18px",
                  borderRadius: 18,
                  border: `1.5px solid ${colors.border}`,
                  background: isDark ? "rgba(15,23,42,0.85)" : "#ffffff",
                  color: colors.text,
                  fontSize: 15,
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* ERROR */}
            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: isDark ? "#fca5a5" : "#b91c1c",
                  padding: 14,
                  borderRadius: 16,
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
              className="login-btn"
              style={{
                width: "100%",
                padding: 17,
                borderRadius: 18,
                border: "none",
                background: loading
                  ? "#475569"
                  : "linear-gradient(135deg,#6366f1,#4f46e5)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.25s ease",
                boxShadow: "0 20px 40px rgba(99,102,241,0.3)",
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
                  <Hash size={18} />
                  Sign In
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* FOOTER */}
          <div
            style={{
              marginTop: 24,
              padding: 18,
              borderRadius: 20,
              background: isDark ? "rgba(30,41,59,0.65)" : "#f0fdf4",
              border: `1px solid ${
                isDark ? "rgba(255,255,255,0.05)" : "#dcfce7"
              }`,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              color: colors.textSecondary,
              lineHeight: 1.7,
              fontSize: 13,
            }}
          >
            <Zap size={16} style={{ marginTop: 2, flexShrink: 0 }} />

            <div>
              <strong>Quick Access:</strong> Your Oracle number gives you access
              to your submitted tickets, support conversations, and ticket
              updates instantly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
