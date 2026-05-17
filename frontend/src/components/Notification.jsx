import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { X, CheckCircle, MessageCircle, Bell } from "lucide-react";

export default function Notification({
  message,
  type = "info",
  onClose,
  duration = 5000,
}) {
  const { isDark, colors } = useTheme();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Allow fade out animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} color="#10b981" />;
      case "message":
        return <MessageCircle size={20} color="#3b82f6" />;
      case "notification":
        return <Bell size={20} color="#f59e0b" />;
      default:
        return <Bell size={20} color={colors.textSecondary} />;
    }
  };

  const getBackground = () => {
    switch (type) {
      case "success":
        return isDark ? "rgba(16, 185, 129, 0.1)" : "#f0fdf4";
      case "message":
        return isDark ? "rgba(59, 130, 246, 0.1)" : "#eff6ff";
      case "notification":
        return isDark ? "rgba(245, 158, 11, 0.1)" : "#fffbeb";
      default:
        return isDark ? "rgba(255,255,255,0.05)" : "#f8fafc";
    }
  };

  if (!visible) return null;

  return (
    <div
      style={{
        zIndex: 1000,
        minWidth: "clamp(300px, 40vw, 400px)",
        maxWidth: "clamp(400px, 50vw, 500px)",
        padding: "clamp(12px, 2vw, 16px)",
        background: getBackground(),
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
        borderRadius: "clamp(12px, 2vw, 16px)",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        gap: "clamp(12px, 2vw, 16px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-20px)",
        transition: "all 0.3s ease",
      }}
    >
      {getIcon()}
      <div
        style={{
          flex: 1,
          fontSize: "clamp(14px, 2vw, 16px)",
          color: colors.text,
          lineHeight: 1.4,
        }}
      >
        {message}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          borderRadius: "6px",
          color: colors.textSecondary,
          transition: "color 0.2s ease",
        }}
        onMouseEnter={(e) => (e.target.style.color = colors.text)}
        onMouseLeave={(e) => (e.target.style.color = colors.textSecondary)}
      >
        <X size={16} />
      </button>
    </div>
  );
}
