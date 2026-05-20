import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getTicket, getMessages, sendUserMessage } from "../api";
import { MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import socket from "../socket";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark, colors } = useTheme();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Load ticket and messages
  useEffect(() => {
    const loadData = async () => {
      try {
        const [ticketRes, messagesRes] = await Promise.all([
          getTicket(id),
          getMessages(id),
        ]);
        setTicket(ticketRes.data);
        setMessages(messagesRes.data);
      } catch (error) {
        console.error("Failed to load ticket:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  // Listen for new messages
  useEffect(() => {
    const handleChatMessage = (message) => {
      if (message.ticketId === Number(id)) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleNewMessage = ({ ticketId, message }) => {
      if (ticketId === Number(id)) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("chat_" + id, handleChatMessage);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("chat_" + id, handleChatMessage);
      socket.off("new_message", handleNewMessage);
    };
  }, [id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket) return;

    setChatLoading(true);
    try {
      await sendUserMessage(id, {
        text: newMessage.trim(),
        senderName: ticket.name,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setChatLoading(false);
    }
  };

  const copyTicketLink = async () => {
    const link = `${window.location.origin}/ticket/${id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopyMessage("Link copied to clipboard!");
    } catch {
      setCopyMessage(
        "Could not copy link. Please use your browser address bar.",
      );
    }
    setTimeout(() => setCopyMessage(""), 2500);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: isDark
            ? "#000000"
            : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(12px, 3vw, 20px)",
        }}
      >
        <div
          style={{
            background: isDark ? colors.cardBg : "#fff",
            borderRadius: "clamp(12px, 2vw, 16px)",
            padding: "clamp(24px, 5vw, 40px)",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <Loader2
            size="clamp(32px, 6vw, 48px)"
            style={{ marginBottom: 16, animation: "spin 1s linear infinite" }}
          />
          <p
            style={{
              fontSize: "clamp(14px, 2vw, 18px)",
              fontWeight: 600,
              color: colors.text,
            }}
          >
            Loading ticket...
          </p>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDark
          ? "#000000"
          : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "clamp(12px, 3vw, 20px)",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: isDark ? colors.cardBg : "#fff",
          borderRadius: "clamp(12px, 2vw, 20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            padding: "clamp(16px, 3vw, 24px)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "clamp(8px, 2vw, 12px)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "clamp(18px, 4vw, 24px)",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Support Ticket #{ticket.id}
              </h1>
              <p
                style={{
                  fontSize: "clamp(13px, 2vw, 16px)",
                  opacity: 0.9,
                }}
              >
                Chat with our IT support team
              </p>
            </div>
            <button
              onClick={copyTicketLink}
              style={{
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "#fff",
                padding: "clamp(8px, 1.5vw, 10px) clamp(12px, 2vw, 16px)",
                borderRadius: "clamp(8px, 1.5vw, 12px)",
                fontSize: "clamp(12px, 2vw, 14px)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = "rgba(255,255,255,0.24)")
              }
              onMouseLeave={(e) =>
                (e.target.style.background = "rgba(255,255,255,0.16)")
              }
            >
              📎 Copy chat link
            </button>
          </div>
          {copyMessage && (
            <p
              style={{
                marginTop: 10,
                fontSize: 13,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {copyMessage}
            </p>
          )}
        </div>

        {/* Ticket Info */}
        <div
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              fontSize: 14,
            }}
          >
            <div>
              <span style={{ color: "#718096", fontWeight: 500 }}>Issue: </span>
              <strong style={{ color: "#2d3748" }}>{ticket.problem}</strong>
            </div>
            <div>
              <span style={{ color: "#718096", fontWeight: 500 }}>
                Department:{" "}
              </span>
              <strong style={{ color: "#2d3748" }}>{ticket.department}</strong>
            </div>
            <div>
              <span style={{ color: "#718096", fontWeight: 500 }}>
                Location:{" "}
              </span>
              <strong style={{ color: "#2d3748" }}>{ticket.location}</strong>
            </div>
            <div>
              <span style={{ color: "#718096", fontWeight: 500 }}>
                Status:{" "}
              </span>
              <span
                style={{
                  background:
                    ticket.status === "resolved"
                      ? "#e8f5e8"
                      : ticket.status === "in_progress"
                        ? "#fff3e0"
                        : "#e3f2fd",
                  color:
                    ticket.status === "resolved"
                      ? "#38a169"
                      : ticket.status === "in_progress"
                        ? "#ed8936"
                        : "#3182ce",
                  padding: "4px 8px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {ticket.status === "in_progress"
                  ? "In Progress"
                  : ticket.status.charAt(0).toUpperCase() +
                    ticket.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Images - If any */}
        {ticket.images && ticket.images.length > 0 && (
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e2e8f0",
              background: isDark
                ? "rgba(15,23,42,0.5)"
                : "rgba(255,255,255,0.5)",
            }}
          >
            <h4
              style={{
                margin: "0 0 12px 0",
                color: colors.text,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Attached Screenshots
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 12,
              }}
            >
              {ticket.images.map((image, index) => (
                <a
                  key={index}
                  href={image}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    border: `1px solid ${colors.border}`,
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <img
                    src={image}
                    alt={`Ticket screenshot ${index + 1}`}
                    style={{
                      width: "100%",
                      height: 120,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Chat Section */}
        <div
          style={{
            height: "500px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              background: isDark ? colors.bg : "#fafbfc",
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: isDark ? "#64748b" : "#a0aec0",
                  padding: "60px 0",
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <MessageCircle size={48} color={colors.text} />
                </div>
                <p
                  style={{ fontSize: 16, fontWeight: 600, color: colors.text }}
                >
                  No messages yet
                </p>
                <p style={{ fontSize: 14, color: colors.text }}>
                  Send a message to start chatting with support!
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent:
                      msg.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      background:
                        msg.sender === "user"
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "#fff",
                      color: msg.sender === "user" ? "#fff" : "#2d3748",
                      padding: "12px 16px",
                      borderRadius:
                        msg.sender === "user"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      border:
                        msg.sender === "agent" ? "1px solid #e2e8f0" : "none",
                    }}
                  >
                    <div style={{ fontSize: 15, lineHeight: 1.4 }}>
                      {msg.text}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.7,
                        marginTop: 6,
                        textAlign: msg.sender === "user" ? "right" : "left",
                      }}
                    >
                      {msg.senderName} ·{" "}
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div
            style={{
              borderTop: `1px solid ${colors.border}`,
              padding: "16px 20px",
              background: isDark ? colors.bg : "#fff",
              display: "flex",
              gap: 12,
            }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !chatLoading && handleSendMessage()
              }
              placeholder="Type your message here..."
              style={{
                flex: 1,
                padding: "12px 16px",
                border: `2px solid ${colors.border}`,
                borderRadius: 24,
                fontSize: 15,
                outline: "none",
                fontFamily: "DM Sans, sans-serif",
                transition: "border-color 0.3s",
                background: isDark ? colors.bg : "#fff",
                color: colors.text,
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = colors.border)}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || chatLoading}
              style={{
                padding: "12px 20px",
                background: chatLoading
                  ? "#a0aec0"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 24,
                cursor: chatLoading ? "not-allowed" : "pointer",
                fontSize: 15,
                fontWeight: 600,
                transition: "transform 0.2s",
                minWidth: 80,
              }}
              onMouseEnter={(e) =>
                !chatLoading && (e.target.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                !chatLoading && (e.target.style.transform = "scale(1)")
              }
            >
              {chatLoading ? "⏳" : "📤 Send"}
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div
          style={{
            padding: "16px 24px",
            background: "#f7fafc",
            borderTop: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "2px solid #667eea",
              color: "#667eea",
              padding: "10px 20px",
              borderRadius: 12,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#667eea";
              e.target.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "none";
              e.target.style.color = "#667eea";
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
