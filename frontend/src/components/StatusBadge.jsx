import { Circle, CheckCircle2, Zap } from "lucide-react";

const icons = {
  open: Circle,
  in_progress: Zap,
  resolved: CheckCircle2,
};

const colors = {
  open: { bg: "#eff6ff", text: "#1d4ed8" },
  in_progress: { bg: "#fed7aa", text: "#c2410c" },
  resolved: { bg: "#ecfdf5", text: "#15803d" },
};

export default function StatusBadge({ status }) {
  const Icon = icons[status] || Circle;
  const style = colors[status] || colors.open;

  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: style.bg,
        color: style.text,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Icon size={14} />
      {status === "resolved"
        ? "Resolved"
        : status === "in_progress"
          ? "In Progress"
          : "Open"}
    </span>
  );
}
