import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import socket from "../socket";

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
  Bell,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   EXPORT CSV
───────────────────────────────────────────────────────────────────────────── */
function exportToCSV(tickets, label = "") {
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

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const suffix = label
    ? `_${label}`
    : `_${new Date().toISOString().split("T")[0]}`;
  a.download = `tickets${suffix}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────────────────────────────────────
   STAT BOX
───────────────────────────────────────────────────────────────────────────── */
function StatBox({ label, value, icon: Icon, color, colors, isDark }) {
  return (
    <div
      style={{
        background: isDark ? "rgba(15,23,42,0.82)" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
        borderRadius: "clamp(16px,2vw,24px)",
        padding: "clamp(16px,3vw,24px)",
        backdropFilter: "blur(14px)",
        boxShadow: isDark
          ? "0 10px 30px rgba(0,0,0,0.28)"
          : "0 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: "clamp(40px,8vw,52px)",
          height: "clamp(40px,8vw,52px)",
          borderRadius: "clamp(12px,2vw,18px)",
          background: `${color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <Icon style={{ color, width: 24, height: 24 }} />
      </div>
      <div
        style={{
          fontSize: "clamp(20px,5vw,36px)",
          fontWeight: 800,
          color,
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "clamp(12px,1.5vw,14px)",
          color: colors.textSecondary,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   AGENT CARD
───────────────────────────────────────────────────────────────────────────── */
function AgentCard({ agent, onDelete, onToggle, colors, isDark }) {
  return (
    <div
      style={{
        background: isDark ? "rgba(15,23,42,0.82)" : "#ffffff",
        borderRadius: "clamp(16px,2vw,24px)",
        padding: "clamp(16px,3vw,24px)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: "clamp(40px,8vw,52px)",
              height: "clamp(40px,8vw,52px)",
              borderRadius: "clamp(12px,2vw,18px)",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "clamp(14px,2vw,18px)",
              flexShrink: 0,
            }}
          >
            {agent.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3
              style={{
                fontWeight: 700,
                color: colors.text,
                fontSize: "clamp(13px,2vw,15px)",
              }}
            >
              {agent.name}
            </h3>
            <p
              style={{
                fontSize: "clamp(11px,1.5vw,13px)",
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
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            <CircleDot style={{ width: 12, height: 12 }} />
            Active
          </span>
        ) : (
          <span
            style={{
              background: "rgba(148,163,184,0.16)",
              color: "#94a3b8",
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            <Circle style={{ width: 12, height: 12 }} />
            Inactive
          </span>
        )}
      </div>

      <div
        style={{
          paddingTop: 16,
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
        }}
      >
        <p
          style={{
            color: colors.textSecondary,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {agent._count?.tickets || 0} tickets assigned
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => onToggle(agent)}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 14,
              border: "none",
              background: isDark ? "rgba(30,41,59,0.95)" : "#f1f5f9",
              color: colors.text,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {agent.isActive ? "Deactivate" : "Activate"}
          </button>

          <button
            onClick={() => onDelete(agent.id)}
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              border: "none",
              background: "rgba(239,68,68,0.14)",
              color: "#ef4444",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   REPORTS TAB
───────────────────────────────────────────────────────────────────────────── */
function ReportsTab({
  tickets,
  filteredReportTickets,
  reportFilter,
  setReportFilter,
  colors,
  isDark,
}) {
  const MONTHS = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];
  const YEARS = Array.from({ length: 6 }, (_, i) =>
    String(new Date().getFullYear() - i),
  );

  const exportLabel =
    reportFilter.mode === "month"
      ? `${reportFilter.year}-${reportFilter.month}`
      : reportFilter.mode === "year"
        ? reportFilter.year
        : reportFilter.mode === "range" && reportFilter.startDate
          ? `${reportFilter.startDate}_to_${reportFilter.endDate || "now"}`
          : "all";

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: 12,
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
    background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    color: colors.text,
    fontSize: 14,
    cursor: "pointer",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 6,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
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
          onClick={() => exportToCSV(filteredReportTickets, exportLabel)}
          style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: 18,
            border: "none",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 14px 30px rgba(99,102,241,0.28)",
            whiteSpace: "nowrap",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Date Filter Panel */}
      <div
        style={{
          background: isDark ? "rgba(15,23,42,0.82)" : "#ffffff",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
          borderRadius: 22,
          padding: "clamp(16px,2vw,24px)",
          backdropFilter: "blur(14px)",
          boxShadow: isDark
            ? "0 10px 30px rgba(0,0,0,0.28)"
            : "0 10px 30px rgba(0,0,0,0.05)",
        }}
      >
        <p
          style={{
            color: colors.text,
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 14,
          }}
        >
          Filter by Date
        </p>

        {/* Mode buttons */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          {[
            { key: "all", label: "All Time" },
            { key: "month", label: "By Month" },
            { key: "year", label: "By Year" },
            { key: "range", label: "Date Range" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setReportFilter((p) => ({ ...p, mode: opt.key }))}
              style={{
                padding: "9px 16px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                background:
                  reportFilter.mode === opt.key
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : isDark
                      ? "rgba(255,255,255,0.06)"
                      : "#f1f5f9",
                color:
                  reportFilter.mode === opt.key ? "#fff" : colors.textSecondary,
                transition: "0.2s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Month picker */}
        {reportFilter.mode === "month" && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div>
              <label style={labelStyle}>Month</label>
              <select
                value={reportFilter.month}
                onChange={(e) =>
                  setReportFilter((p) => ({ ...p, month: e.target.value }))
                }
                style={{ ...inputStyle, background: isDark ? "rgba(15,23,42,0.82)" : "#f8fafc" }}
              >
                <option value="">
                  -- Select month --
                </option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={m}>
                    {new Date(2000, i).toLocaleString("en-GB", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Year</label>
              <select
                value={reportFilter.year}
                onChange={(e) =>
                  setReportFilter((p) => ({ ...p, year: e.target.value }))
                }
                style={{ ...inputStyle, background: isDark ? "rgba(15,23,42,0.82)" : "#f8fafc" }}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Year picker */}
        {reportFilter.mode === "year" && (
          <div>
            <label style={labelStyle}>Year</label>
            <select
              value={reportFilter.year}
              onChange={(e) =>
                setReportFilter((p) => ({ ...p, year: e.target.value }))
              }
              style={{ ...inputStyle, background: isDark ? "rgba(15,23,42,0.82)" : "#f8fafc" }}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date range pickers */}
        {reportFilter.mode === "range" && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div>
              <label style={labelStyle}>From</label>
              <input
                type="date"
                value={reportFilter.startDate}
                onChange={(e) =>
                  setReportFilter((p) => ({ ...p, startDate: e.target.value }))
                }
                style={{ ...inputStyle, background: isDark ? "rgba(15,23,42,0.82)" : "#f8fafc" }}
              />
            </div>
            <div>
              <label style={labelStyle}>To</label>
              <input
                type="date"
                value={reportFilter.endDate}
                onChange={(e) =>
                  setReportFilter((p) => ({ ...p, endDate: e.target.value }))
                }
                style={{ ...inputStyle, background: isDark ? "rgba(15,23,42,0.82)" : "#f8fafc" }}
              />
            </div>
          </div>
        )}

        {/* Match count badge */}
        <div
          style={{
            marginTop: 16,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: isDark ? "rgba(99,102,241,0.15)" : "#eef2ff",
            color: isDark ? "#a5b4fc" : "#4f46e5",
            padding: "8px 14px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          <FileText style={{ width: 14, height: 14 }} />
          {filteredReportTickets.length} record
          {filteredReportTickets.length !== 1 ? "s" : ""} match
          {filteredReportTickets.length !== 1 ? "" : "es"} this filter
        </div>
      </div>

      {/* Stats cards (driven by filteredReportTickets) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 16,
        }}
      >
        {[
          {
            label: "Total",
            value: filteredReportTickets.length,
            color: "#6366f1",
          },
          {
            label: "Resolved",
            value: filteredReportTickets.filter((t) => t.status === "resolved")
              .length,
            color: "#10b981",
          },
          {
            label: "Open",
            value: filteredReportTickets.filter((t) => t.status === "open")
              .length,
            color: "#3b82f6",
          },
          {
            label: "In Progress",
            value: filteredReportTickets.filter(
              (t) => t.status === "in_progress",
            ).length,
            color: "#f59e0b",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: isDark ? "rgba(15,23,42,0.82)" : "#ffffff",
              borderRadius: 22,
              padding: "clamp(16px,2vw,22px)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
              backdropFilter: "blur(12px)",
            }}
          >
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
        ))}
      </div>

      {/* Table card */}
      <div
        style={{
          background: isDark
            ? "linear-gradient(145deg,rgba(15,23,42,0.95),rgba(30,41,59,0.92))"
            : "#ffffff",
          borderRadius: "clamp(22px,3vw,30px)",
          overflow: "hidden",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
          backdropFilter: "blur(14px)",
          boxShadow: isDark
            ? "0 20px 50px rgba(0,0,0,0.35)"
            : "0 20px 50px rgba(0,0,0,0.05)",
        }}
      >
        {/* Table header */}
        <div
          style={{
            padding: "clamp(18px,3vw,28px)",
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
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
            <p style={{ color: colors.textSecondary, fontSize: 13 }}>
              Showing {filteredReportTickets.length} of {tickets.length} total
              tickets
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
            }}
          >
            {filteredReportTickets.length} Records
          </div>
        </div>

        {/* Mobile cards */}
        <div style={{ display: "block", padding: 16 }} className="lg-hidden">
          {filteredReportTickets.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: colors.textSecondary,
              }}
            >
              No records match the selected filter.
            </p>
          ) : (
            filteredReportTickets.map((t) => (
              <div
                key={t.id}
                style={{
                  background: isDark ? "rgba(2,6,23,0.72)" : "#f8fafc",
                  borderRadius: 20,
                  padding: 18,
                  marginBottom: 12,
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
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
                  <span
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
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.priority}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
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
            ))
          )}
        </div>

        {/* Desktop table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                }}
              >
                {[
                  "ID",
                  "Problem",
                  "Priority",
                  "Status",
                  "Department",
                  "Agent",
                  "Created",
                ].map((h) => (
                  <th
                    key={h}
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
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReportTickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "40px 22px",
                      textAlign: "center",
                      color: colors.textSecondary,
                    }}
                  >
                    No records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredReportTickets.map((t, i) => (
                  <tr
                    key={t.id}
                    style={{
                      borderTop:
                        i === 0
                          ? "none"
                          : `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#eef2f7"}`,
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
                        fontWeight: 600,
                        minWidth: 220,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: 300,
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
                          padding: "6px 12px",
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
                      {t.status.replace("_", " ")}
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
                      {t.agent?.name || "Unassigned"}
                    </td>
                    <td
                      style={{
                        padding: "20px 22px",
                        color: colors.textSecondary,
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {new Date(t.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN ADMIN PANEL
───────────────────────────────────────────────────────────────────────────── */
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

  const [reportFilter, setReportFilter] = useState({
    mode: "all",
    month: "",
    year: String(new Date().getFullYear()),
    startDate: "",
    endDate: "",
  });

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
    }
  }, [user, navigate]);

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Socket: keep ticket list in sync in real time ──────────────────────────
  useEffect(() => {
    const onNewTicket = (ticket) => {
      setTickets((prev) => {
        if (prev.some((t) => t.id === ticket.id)) return prev;
        return [ticket, ...prev];
      });
      // Update stats total
      setStats((prev) =>
        prev
          ? {
              ...prev,
              total: (prev.total || 0) + 1,
              byStatus: {
                ...prev.byStatus,
                open: (prev.byStatus?.open || 0) + 1,
              },
            }
          : prev,
      );
    };

    const onTicketUpdated = (updated) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
    };

    const onTicketDeleted = ({ id }) => {
      setTickets((prev) => prev.filter((t) => t.id !== id));
    };

    socket.on("new_ticket", onNewTicket);
    socket.on("ticket_updated", onTicketUpdated);
    socket.on("ticket_deleted", onTicketDeleted);

    return () => {
      socket.off("new_ticket", onNewTicket);
      socket.off("ticket_updated", onTicketUpdated);
      socket.off("ticket_deleted", onTicketDeleted);
    };
  }, []);

  // ── Agent handlers ─────────────────────────────────────────────────────────
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
      setNewAgent({ name: "", username: "", password: "" });
      setAgentSuccess(`Agent "${res.data.name}" created successfully!`);
      setTimeout(() => setAgentSuccess(""), 4000);
    } catch (err) {
      setAgentError(err.response?.data?.error || "Could not create agent");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAgent = async (id) => {
    if (!window.confirm("Remove this agent? This cannot be undone.")) return;
    try {
      await deleteAgent(id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Could not delete agent");
    }
  };

  const handleToggleAgent = async (agent) => {
    try {
      const res = await updateAgent(agent.id, { isActive: !agent.isActive });
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, ...res.data } : a)),
      );
    } catch {
      alert("Could not update agent");
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket permanently?")) return;
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Could not delete ticket");
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const deptCounts = tickets.reduce((acc, t) => {
    acc[t.department] = (acc[t.department] || 0) + 1;
    return acc;
  }, {});
  const deptData = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

  const avgResolutionTime = (() => {
    const resolved = tickets.filter((t) => t.resolvedAt);
    if (resolved.length === 0) return 0;
    const total = resolved.reduce(
      (sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.createdAt)),
      0,
    );
    return Math.round(total / resolved.length / 3600000);
  })();

  const filteredReportTickets = (() => {
    const { mode, month, year, startDate, endDate } = reportFilter;
    return tickets.filter((t) => {
      const d = new Date(t.createdAt);
      if (mode === "month") {
        return (
          String(d.getFullYear()) === year &&
          String(d.getMonth() + 1).padStart(2, "0") === month
        );
      }
      if (mode === "year") return String(d.getFullYear()) === year;
      if (mode === "range") {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate + "T23:59:59") : null;
        if (start && d < start) return false;
        if (end && d > end) return false;
      }
      return true;
    });
  })();

  // ── Loading spinner ────────────────────────────────────────────────────────
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
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              border: `4px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
              borderTopColor: "#6366f1",
              margin: "0 auto 18px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ color: colors.textSecondary }}>Loading admin panel...</p>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const TABS = [
    { key: "overview", label: "Overview", icon: Activity },
    { key: "agents", label: "Agents", icon: Users, count: agents.length },
    { key: "reports", label: "Reports", icon: TrendingUp },
    { key: "tickets", label: "Tickets", icon: FileText, count: tickets.length },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDark
          ? `radial-gradient(circle at top right,rgba(99,102,241,0.14),transparent 26%),
             radial-gradient(circle at bottom left,rgba(168,85,247,0.12),transparent 24%),
             #020617`
          : "#f8fafc",
      }}
    >
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* ── STICKY HEADER ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(14px)",
          background: isDark ? "rgba(2,6,23,0.78)" : "rgba(255,255,255,0.88)",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "16px clamp(16px,3vw,32px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
                flexShrink: 0,
              }}
            >
              <BarChart3 style={{ width: 28, height: 28 }} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: colors.text }}>
                Admin Dashboard
              </h1>
              <p style={{ fontSize: 13, color: colors.textSecondary }}>
                IT Support Management System
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontWeight: 700, color: colors.text }}>
                {user?.username}
              </p>
              <p style={{ fontSize: 12, color: colors.textSecondary }}>
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
                boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <LogOut style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(16px,3vw,32px)",
        }}
      >
        {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            borderRadius: 34,
            overflow: "hidden",
            minHeight: 280,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
            marginBottom: 32,
          }}
        >
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg,rgba(2,6,23,0.44),rgba(79,70,229,0.22),rgba(15,23,42,0.38))",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: "clamp(24px,5vw,48px)",
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
              <Shield style={{ width: 40, height: 40 }} />
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

        {/* ── TAB BAR ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 8,
            marginBottom: 32,
          }}
        >
          {TABS.map(({ key, label, icon: Icon, count }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: "14px 20px",
                  borderRadius: 18,
                  border: active
                    ? "none"
                    : `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
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
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: 16, height: 16 }} />
                {label}
                {count !== undefined && (
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
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── OVERVIEW TAB ────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                gap: 20,
              }}
            >
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
                gap: 24,
              }}
            >
              {/* Departments */}
              <div
                style={{
                  background: isDark ? "rgba(15,23,42,0.82)" : "#ffffff",
                  borderRadius: 24,
                  padding: 28,
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
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
                  <Building2 style={{ width: 20, height: 20 }} />
                  Tickets by Department
                </h2>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 18 }}
                >
                  {deptData.map(([dept, count]) => {
                    const pct = ((count / (tickets.length || 1)) * 100).toFixed(
                      0,
                    );
                    return (
                      <div key={dept}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <span style={{ color: colors.text, fontWeight: 600 }}>
                            {dept}
                          </span>
                          <span style={{ color: "#6366f1", fontWeight: 700 }}>
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
                  {deptData.length === 0 && (
                    <p
                      style={{
                        color: colors.textSecondary,
                        textAlign: "center",
                        padding: "20px 0",
                      }}
                    >
                      No tickets yet
                    </p>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div
                style={{
                  background: isDark ? "rgba(15,23,42,0.82)" : "#ffffff",
                  borderRadius: 24,
                  padding: 28,
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
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
                  <TrendingUp style={{ width: 20, height: 20 }} />
                  Priority Breakdown
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 16,
                  }}
                >
                  {[
                    { label: "High", key: "high", color: "#ef4444" },
                    { label: "Medium", key: "medium", color: "#f59e0b" },
                    { label: "Low", key: "low", color: "#10b981" },
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
                        style={{ fontSize: 13, color: colors.textSecondary }}
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

        {/* ── AGENTS TAB ──────────────────────────────────────────────────── */}
        {tab === "agents" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* Create agent form */}
            <div
              style={{
                background: isDark
                  ? "linear-gradient(145deg,rgba(15,23,42,0.95),rgba(30,41,59,0.92))"
                  : "#ffffff",
                borderRadius: 30,
                padding: "clamp(20px,4vw,36px)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                backdropFilter: "blur(16px)",
                boxShadow: isDark
                  ? "0 20px 50px rgba(0,0,0,0.45)"
                  : "0 20px 40px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 28,
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
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
                  <p style={{ color: colors.textSecondary, fontSize: 14 }}>
                    Add and manage support agents for the IT helpdesk
                  </p>
                </div>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background:
                      "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.25))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.08)",
                    flexShrink: 0,
                  }}
                >
                  <Users style={{ width: 28, height: 28, color: "#818cf8" }} />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
                  gap: 20,
                  marginBottom: 20,
                }}
              >
                {[
                  {
                    key: "name",
                    label: "Full Name",
                    type: "text",
                    placeholder: "e.g. John Doe",
                  },
                  {
                    key: "username",
                    label: "Username",
                    type: "text",
                    placeholder: "e.g. johndoe",
                  },
                  {
                    key: "password",
                    label: "Password",
                    type: "password",
                    placeholder: "Minimum 6 characters",
                  },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: colors.textSecondary,
                      }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={newAgent[key]}
                      onChange={(e) =>
                        setNewAgent((p) => ({ ...p, [key]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateAgent();
                      }}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        borderRadius: 16,
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#dbe3ea"}`,
                        background: isDark ? "rgba(2,6,23,0.65)" : "#ffffff",
                        color: colors.text,
                        outline: "none",
                        fontSize: 14,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
              </div>

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
                  }}
                >
                  {agentError}
                </div>
              )}
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
                  }}
                >
                  {agentSuccess}
                </div>
              )}

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
                  cursor: creating ? "not-allowed" : "pointer",
                  boxShadow: "0 10px 30px rgba(99,102,241,0.35)",
                  opacity: creating ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {creating ? (
                  <>
                    <Loader2
                      style={{
                        width: 16,
                        height: 16,
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Creating Agent...
                  </>
                ) : (
                  <>
                    <Plus style={{ width: 16, height: 16 }} />
                    Create Agent
                  </>
                )}
              </button>
            </div>

            {/* Agent list */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <h2
                  style={{ color: colors.text, fontSize: 22, fontWeight: 800 }}
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
              {agents.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: colors.textSecondary,
                    background: isDark ? "rgba(15,23,42,0.5)" : "#f8fafc",
                    borderRadius: 24,
                    border: `2px dashed ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
                  }}
                >
                  <Users
                    style={{
                      width: 48,
                      height: 48,
                      margin: "0 auto 16px",
                      opacity: 0.4,
                    }}
                  />
                  <p style={{ fontWeight: 600 }}>No agents registered yet.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                    gap: 20,
                  }}
                >
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
              )}
            </div>
          </div>
        )}

        {/* ── REPORTS TAB ─────────────────────────────────────────────────── */}
        {tab === "reports" && (
          <ReportsTab
            tickets={tickets}
            filteredReportTickets={filteredReportTickets}
            reportFilter={reportFilter}
            setReportFilter={setReportFilter}
            colors={colors}
            isDark={isDark}
          />
        )}

        {/* ── TICKETS TAB ─────────────────────────────────────────────────── */}
        {tab === "tickets" && (
          <div
            style={{
              background: isDark
                ? "linear-gradient(145deg,rgba(15,23,42,0.95),rgba(30,41,59,0.92))"
                : "#ffffff",
              borderRadius: "clamp(22px,3vw,30px)",
              overflow: "hidden",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
              backdropFilter: "blur(14px)",
              boxShadow: isDark
                ? "0 20px 50px rgba(0,0,0,0.35)"
                : "0 20px 50px rgba(0,0,0,0.05)",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "clamp(18px,3vw,28px)",
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
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
                <p style={{ color: colors.textSecondary, fontSize: 14 }}>
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
                }}
              >
                {tickets.length} Tickets
              </div>
            </div>

            {/* Mobile cards */}
            <div style={{ padding: 16 }}>
              {tickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: isDark ? "rgba(2,6,23,0.72)" : "#f8fafc",
                    borderRadius: 20,
                    padding: 18,
                    marginBottom: 12,
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 16,
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
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
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
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
                            : t.status === "in_progress"
                              ? "rgba(245,158,11,0.14)"
                              : "rgba(59,130,246,0.14)",
                        color:
                          t.status === "resolved"
                            ? "#10b981"
                            : t.status === "in_progress"
                              ? "#f59e0b"
                              : "#3b82f6",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "capitalize",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
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
                        PRIORITY
                      </p>
                      <p
                        style={{
                          color:
                            t.priority === "high"
                              ? "#ef4444"
                              : t.priority === "medium"
                                ? "#f59e0b"
                                : "#10b981",
                          fontWeight: 700,
                          fontSize: 13,
                          textTransform: "capitalize",
                        }}
                      >
                        {t.priority}
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
                    <Trash2 style={{ width: 16, height: 16 }} />
                    Delete Ticket
                  </button>
                </div>
              ))}
              {tickets.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: colors.textSecondary,
                  }}
                >
                  No tickets found.
                </p>
              )}
            </div>

            {/* Desktop table */}
            <div style={{ display: "none" }} className="desktop-table">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                        "Staff",
                        "Department",
                        "Priority",
                        "Status",
                        "Agent",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
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
                          {h}
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
                              : `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#eef2f7"}`,
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
                              padding: "6px 12px",
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
                        <td style={{ padding: "20px 22px" }}>
                          <span
                            style={{
                              padding: "8px 12px",
                              borderRadius: 999,
                              background:
                                t.status === "resolved"
                                  ? "rgba(16,185,129,0.14)"
                                  : t.status === "in_progress"
                                    ? "rgba(245,158,11,0.14)"
                                    : "rgba(59,130,246,0.14)",
                              color:
                                t.status === "resolved"
                                  ? "#10b981"
                                  : t.status === "in_progress"
                                    ? "#f59e0b"
                                    : "#3b82f6",
                              fontSize: 12,
                              fontWeight: 700,
                              textTransform: "capitalize",
                            }}
                          >
                            {t.status.replace("_", " ")}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "20px 22px",
                            color: colors.textSecondary,
                            fontWeight: 600,
                          }}
                        >
                          {t.agent?.name || "Unassigned"}
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
                            <Trash2 style={{ width: 16, height: 16 }} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Show desktop table on lg screens via a style tag */}
            <style>{`
              @media (min-width: 1024px) {
                .desktop-table { display: block !important; }
                .lg-hidden { display: none !important; }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}
