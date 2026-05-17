import { User, Building, MapPin, Wrench } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

export default function TicketCard({ ticket, onClick }) {
  // Format date nicely
  const date = new Date(ticket.createdAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="ticket-card fade-in"
      onClick={() => onClick && onClick(ticket)}
      style={{
        background: "#fff",
        borderRadius: "clamp(8px, 2vw, 12px)",
        padding: "clamp(12px, 3vw, 20px)",
        cursor: onClick ? "pointer" : "default",
        border: "1px solid #eee",
        borderLeft: `4px solid ${
          ticket.priority === "high"
            ? "#e74c3c"
            : ticket.priority === "medium"
              ? "#f39c12"
              : "#27ae60"
        }`,
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "clamp(8px, 2vw, 10px)",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
        <span
          style={{
            fontSize: "clamp(10px, 1.5vw, 12px)",
            color: "#999",
            whiteSpace: "nowrap",
          }}
        >
          #{ticket.id}
        </span>
      </div>

      {/* Problem description */}
      <p
        style={{
          fontWeight: 600,
          fontSize: "clamp(13px, 2vw, 15px)",
          marginBottom: "clamp(6px, 1.5vw, 8px)",
          color: "#1a1a2e",
          wordBreak: "break-word",
        }}
      >
        {ticket.problem}
      </p>

      {/* Details row */}
      <div
        style={{
          display: "flex",
          gap: "clamp(10px, 2vw, 16px)",
          flexWrap: "wrap",
          fontSize: "clamp(12px, 1.5vw, 13px)",
          color: "#666",
          alignItems: "center",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            minWidth: "fit-content",
          }}
        >
          <User size={14} />{" "}
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {ticket.name}
          </span>
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            minWidth: "fit-content",
          }}
        >
          <Building size={14} />{" "}
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {ticket.department}
          </span>
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            minWidth: "fit-content",
          }}
        >
          <MapPin size={14} />{" "}
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {ticket.location}
          </span>
        </span>
        {ticket.agentName && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              minWidth: "fit-content",
            }}
          >
            <Wrench size={14} />{" "}
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {ticket.agentName}
            </span>
          </span>
        )}
      </div>

      {/* Date */}
      <p
        style={{
          fontSize: "clamp(10px, 1.5vw, 12px)",
          color: "#bbb",
          marginTop: "clamp(8px, 1.5vw, 10px)",
        }}
      >
        {date}
      </p>
    </div>
  );
}
