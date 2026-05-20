import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getTicket, getMessages, sendUserMessage } from "../api";
import socket from "../socket";

import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

import {
  ArrowLeft,
  MessageCircle,
  Send,
  Loader2,
  User,
  ShieldCheck,
} from "lucide-react";

export default function UserTicketChat() {
  const { ticketId } = useParams();

  const navigate = useNavigate();

  const { isDark, colors } = useTheme();

  const [ticket, setTicket] = useState(null);

  const [messages, setMessages] = useState([]);

  const [newMsg, setNewMsg] = useState("");

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  /* LOAD TICKET */
  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      const res = await getTicket(ticketId);

      setTicket(res.data);

      await loadMessages();
    } catch (err) {
      console.error("Failed to load ticket", err);

      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  /* LOAD MESSAGES */
  const loadMessages = async () => {
    try {
      const res = await getMessages(ticketId);

      setMessages(res.data);

      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  /* SOCKET EVENTS */
  useEffect(() => {
    const handleNewMsg = ({ ticketId: tid, message }) => {
      if (Number(tid) === Number(ticketId)) {
        setMessages((prev) => [...prev, message]);

        setTimeout(() => scrollToBottom(), 100);
      }
    };

    const handleTicketUpdate = (updated) => {
      if (updated.id === Number(ticketId)) {
        setTicket(updated);
      }
    };

    socket.on("new_message", handleNewMsg);

    socket.on("ticket_updated", handleTicketUpdate);

    return () => {
      socket.off("new_message", handleNewMsg);

      socket.off("ticket_updated", handleTicketUpdate);
    };
  }, [ticketId]);

  /* AUTO SCROLL */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  /* SEND MESSAGE */
  const handleSendMessage = async () => {
    if (!newMsg.trim() || sending) return;

    const text = newMsg;

    setNewMsg("");

    setSending(true);

    try {
      const res = await sendUserMessage(ticketId, {
        text,
        senderName: ticket?.name,
      });

      if (res?.data) {
        setMessages((prev) => [...prev, res.data]);

        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (err) {
      console.error("Failed to send message", err);

      setNewMsg(text);

      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  /* LOADING */
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
        <div className="text-center">
          <div
            style={{
              width: 70,
              height: 70,

              borderRadius: "50%",

              border: `4px solid ${
                isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"
              }`,

              borderTopColor: "#6366f1",

              margin: "0 auto 18px",

              animation: "spin 1s linear infinite",
            }}
          />

          <p
            style={{
              color: colors.textSecondary,
              fontWeight: 600,
            }}
          >
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  /* NO TICKET */
  if (!ticket) {
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
        <div className="text-center">
          <p
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            Ticket not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",

        display: "flex",
        flexDirection: "column",

        background: isDark
          ? `
            radial-gradient(circle at top right, rgba(99,102,241,0.12), transparent 26%),
            radial-gradient(circle at bottom left, rgba(168,85,247,0.12), transparent 24%),
            #020617
          `
          : "#f8fafc",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,

          padding: "16px 18px",

          backdropFilter: "blur(14px)",

          background: isDark ? "rgba(2,6,23,0.78)" : "rgba(255,255,255,0.88)",

          borderBottom: `1px solid ${
            isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
          }`,
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/my-tickets")}
              style={{
                width: 44,
                height: 44,

                borderRadius: 14,

                border: "none",

                background: isDark ? "rgba(30,41,59,0.95)" : "#ffffff",

                color: colors.text,

                cursor: "pointer",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h1
                style={{
                  color: colors.text,
                  fontSize: 20,
                  fontWeight: 800,
                  marginBottom: 4,
                }}
              >
                Support Chat
              </h1>

              <p
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                }}
              >
                Ticket #{ticket.id}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <PriorityBadge priority={ticket.priority} />

            <StatusBadge status={ticket.status} />
          </div>
        </div>
      </div>

      {/* PROBLEM CARD */}
      <div className="px-4 pt-4">
        <div
          style={{
            background: isDark
              ? "rgba(15,23,42,0.82)"
              : "rgba(255,255,255,0.9)",

            borderRadius: 22,

            padding: 20,

            border: `1px solid ${
              isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
            }`,

            backdropFilter: "blur(14px)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              style={{
                width: 46,
                height: 46,

                borderRadius: 16,

                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                color: "#fff",
              }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h2
                style={{
                  color: colors.text,
                  fontWeight: 700,
                  marginBottom: 8,
                  lineHeight: 1.5,
                }}
              >
                {ticket.problem}
              </h2>

              <p
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                }}
              >
                Support team will respond shortly.
              </p>

              {/* Images if any */}
              {ticket.images && ticket.images.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <p
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      marginBottom: 8,
                    }}
                  >
                    📸 {ticket.images.length} screenshot(s) attached
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div
        style={{
          flex: 1,

          overflowY: "auto",

          padding: "20px 16px",

          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              margin: "auto",

              textAlign: "center",

              color: colors.textSecondary,
            }}
          >
            <MessageCircle
              className="w-14 h-14 mx-auto mb-4"
              style={{ opacity: 0.4 }}
            />

            <p>No messages yet.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id || idx}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",

                    padding: "12px 14px",

                    borderRadius: 20,

                    background: isUser
                      ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                      : isDark
                        ? "rgba(15,23,42,0.92)"
                        : "#ffffff",

                    color: isUser ? "#fff" : colors.text,

                    border: isUser
                      ? "none"
                      : `1px solid ${
                          isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
                        }`,

                    boxShadow: isDark
                      ? "0 10px 30px rgba(0,0,0,0.25)"
                      : "0 10px 25px rgba(0,0,0,0.04)",
                  }}
                >
                  {!isUser && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,

                        marginBottom: 8,

                        color: "#6366f1",

                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <User className="w-3 h-3" />
                      {msg.senderName || "Support Agent"}
                    </div>
                  )}

                  <div
                    style={{
                      lineHeight: 1.7,
                      fontSize: 14,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </div>

                  <div
                    style={{
                      marginTop: 8,

                      fontSize: 11,

                      opacity: 0.7,

                      textAlign: "right",
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div
        style={{
          padding: 16,

          borderTop: `1px solid ${
            isDark ? "rgba(255,255,255,0.06)" : "#e2e8f0"
          }`,

          background: isDark ? "rgba(2,6,23,0.9)" : "rgba(255,255,255,0.92)",

          backdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !sending) {
                e.preventDefault();

                handleSendMessage();
              }
            }}
            disabled={sending}
            style={{
              flex: 1,

              padding: "14px 18px",

              borderRadius: 18,

              border: `1px solid ${
                isDark ? "rgba(255,255,255,0.08)" : "#dbe3ea"
              }`,

              background: isDark ? "rgba(15,23,42,0.9)" : "#ffffff",

              color: colors.text,

              outline: "none",

              fontSize: 14,
            }}
          />

          <button
            onClick={handleSendMessage}
            disabled={sending || !newMsg.trim()}
            style={{
              minWidth: 54,
              height: 54,

              borderRadius: 18,

              border: "none",

              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",

              color: "#fff",

              cursor: "pointer",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              opacity: sending || !newMsg.trim() ? 0.6 : 1,
            }}
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
