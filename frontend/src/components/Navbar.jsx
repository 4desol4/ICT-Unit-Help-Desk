import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Wrench,
  Settings,
  Monitor,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();

  const [mobileMenu, setMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenu(false);
  };

  const handleCloseMenu = () => {
    setMobileMenu(false);
  };

  const linkStyle = {
    color: isDark ? "#cbd5e1" : "#475569",
    textDecoration: "none",
    padding: "11px 16px",
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 600,
    transition: "all 0.25s ease",
    display: "flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: "#6366f1",
    background: isDark ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.12)",
    boxShadow: isDark
      ? "0 6px 18px rgba(99,102,241,0.18)"
      : "0 6px 16px rgba(99,102,241,0.12)",
  };

  const navItems = !user
    ? [
        { to: "/user/login", label: "User Login" },
        { to: "/agent/login", label: "Agent Login" },
        { to: "/admin/login", label: "Admin Login" },
      ]
    : user.role === "agent"
      ? [{ to: "/agent", label: "Dashboard", icon: Monitor }]
      : user.role === "admin"
        ? [{ to: "/admin", label: "Admin Panel", icon: Settings }]
        : [];

  return (
    <>
      <style>{`
        .navbar-btn:hover,
        .navbar-link:hover {
          transform: translateY(-1px);
          background: rgba(99,102,241,0.10);
          color: #6366f1 !important;
        }

        .mobile-menu {
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }

          .mobile-toggle {
            display: flex !important;
          }

          .navbar-logo-text {
            font-size: 14px !important;
          }

          .navbar-subtitle {
            font-size: 11px !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-container {
            display: none !important;
          }

          .mobile-toggle {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .navbar-wrapper {
            padding: 12px 14px !important;
          }

          .logo-image {
            width: 42px !important;
            height: 42px !important;
          }

          .mobile-menu-content {
            padding: 14px !important;
          }
        }
      `}</style>

      <nav
        className="navbar-wrapper"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          width: "100%",
          background: isDark ? "rgba(7,11,22,0.92)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: `1px solid ${colors.border}`,
          padding: "14px clamp(16px, 3vw, 28px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          transition: "all 0.3s ease",
          boxShadow: isDark
            ? "0 4px 20px rgba(0,0,0,0.35)"
            : "0 4px 20px rgba(15,23,42,0.05)",
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
            flex: 1,
          }}
        >
          {/* Logo */}
          <div
            className="logo-image"
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: isDark
                ? "linear-gradient(135deg,#1e293b,#0f172a)"
                : "linear-gradient(135deg,#eef2ff,#ffffff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
              border: `1px solid ${colors.border}`,
            }}
          >
            <img
              src="/mlogo.png"
              alt="ICT Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Title */}
          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              className="navbar-logo-text"
              style={{
                color: isDark ? "#f8fafc" : "#0f172a",
                fontWeight: 800,
                fontSize: 17,
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              ICT Unit Help Desk
            </div>

            <div
              className="navbar-subtitle"
              style={{
                color: isDark ? "#94a3b8" : "#64748b",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {user?.role === "user"
                ? "Fast support assistance"
                : "Smart ICT support platform"}
            </div>
          </div>
        </div>

        {/* DESKTOP NAV */}
        <div
          className="desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                style={isActive ? activeLinkStyle : linkStyle}
                className="navbar-link"
              >
                {item.icon ? <item.icon size={16} /> : null}
                {item.label}
              </Link>
            );
          })}

          {/* Submit Ticket */}
          {user?.role === "user" && (
            <Link
              to="/"
              style={location.pathname === "/" ? activeLinkStyle : linkStyle}
              className="navbar-link"
            >
              <Wrench size={16} />
              Submit Ticket
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="navbar-btn"
            style={{
              border: `1px solid ${colors.border}`,
              background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
              color: colors.text,
              padding: "11px 14px",
              borderRadius: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 700,
              transition: "all 0.25s ease",
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? "Light" : "Dark"}
          </button>

          {/* Logout */}
          {user && (
            <button
              onClick={handleLogout}
              className="navbar-btn"
              style={{
                border: `1px solid ${colors.border}`,
                background: "transparent",
                color: colors.text,
                padding: "11px 14px",
                borderRadius: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 700,
                transition: "all 0.25s ease",
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenu(!mobileMenu)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            border: `1px solid ${colors.border}`,
            background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
            color: colors.text,
            cursor: "pointer",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.25s ease",
            flexShrink: 0,
          }}
        >
          {mobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div
          className="mobile-menu mobile-menu-container"
          style={{
            position: "sticky",
            top: 82,
            zIndex: 999,
            padding: 14,
            background: isDark
              ? "rgba(7,11,22,0.98)"
              : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(18px)",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div
            className="mobile-menu-content"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            {/* Nav Links */}
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={handleCloseMenu}
                  style={{
                    ...(isActive ? activeLinkStyle : linkStyle),
                    width: "100%",
                    justifyContent: "flex-start",
                  }}
                  className="navbar-link"
                >
                  {item.icon ? <item.icon size={18} /> : null}
                  {item.label}
                </Link>
              );
            })}

            {/* Submit Ticket */}
            {user?.role === "user" && (
              <Link
                to="/"
                onClick={handleCloseMenu}
                style={{
                  ...(location.pathname === "/" ? activeLinkStyle : linkStyle),
                  width: "100%",
                }}
                className="navbar-link"
              >
                <Wrench size={18} />
                Submit Ticket
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="navbar-btn"
              style={{
                width: "100%",
                border: `1px solid ${colors.border}`,
                background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                color: colors.text,
                padding: "13px 16px",
                borderRadius: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              Switch to {isDark ? "Light" : "Dark"} Mode
            </button>

            {/* Logout */}
            {user && (
              <button
                onClick={handleLogout}
                className="navbar-btn"
                style={{
                  width: "100%",
                  border: `1px solid ${colors.border}`,
                  background: "transparent",
                  color: "#ef4444",
                  padding: "13px 16px",
                  borderRadius: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
