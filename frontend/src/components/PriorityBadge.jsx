import { AlertCircle, AlertTriangle, Info } from "lucide-react";

const icons = {
  high: AlertCircle,
  medium: AlertTriangle,
  low: Info,
};

const colors = {
  high: { bg: "#fee2e2", text: "#991b1b" },
  medium: { bg: "#fef3c7", text: "#b45309" },
  low: { bg: "#ecfdf5", text: "#15803d" },
};

export default function PriorityBadge({ priority }) {
  const Icon = icons[priority] || AlertCircle;
  const style = colors[priority] || colors.high;

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
      {priority === "high" ? "High" : priority === "medium" ? "Medium" : "Low"}
    </span>
  );
}
