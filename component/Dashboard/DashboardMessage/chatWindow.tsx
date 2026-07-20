"use client";
import { IoIosCall, IoIosVideocam, IoIosArrowBack, IoIosSend } from "react-icons/io";
import { MdHistory, MdClose, MdCallMissed, MdCallEnd, MdCall } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useCall } from "@/context/CallContext";
import { messageApi } from "@/utils/api";
import type { ChatMessage, Conversation } from "@/types/auth";

type CallLogEntry = {
  id: string;
  callType: "audio" | "video";
  status: "ringing" | "accepted" | "missed" | "rejected" | "canceled" | "completed";
  startedAt: string;
  durationSeconds: number;
  caller: { id: string; fullName: string; image?: string | null } | null;
  callee: { id: string; fullName: string; image?: string | null } | null;
};

const formatDuration = (seconds: number) => {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const callStatusLabel: Record<CallLogEntry["status"], string> = {
  ringing: "Ringing…",
  accepted: "In call",
  missed: "Missed",
  rejected: "Declined",
  canceled: "Canceled",
  completed: "Completed",
};

type ChatWindowProps = {
  conversation: Conversation;
  messages: ChatMessage[];
  loading: boolean;
  currentUserId?: string;
  isTyping: boolean;
  onBack: () => void;
  onSend: (content: string) => Promise<void>;
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatWindow({
  conversation, messages, loading, currentUserId, isTyping, onBack, onSend,
}: ChatWindowProps) {
  const { socket } = useSocket();
  const { startCall, status: callStatus } = useCall();

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [showCallLog, setShowCallLog] = useState(false);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([]);
  const [loadingCallLogs, setLoadingCallLogs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingLocallyRef = useRef(false);

  const otherUser = conversation.otherUser;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const emitTypingStop = () => {
    if (!otherUser || !isTypingLocallyRef.current) return;
    socket?.emit("typing:stop", { toUserId: otherUser.id, conversationId: conversation.id });
    isTypingLocallyRef.current = false;
  };

  const handleChange = (value: string) => {
    setDraft(value);
    if (!otherUser) return;

    if (!isTypingLocallyRef.current) {
      socket?.emit("typing:start", { toUserId: otherUser.id, conversationId: conversation.id });
      isTypingLocallyRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(emitTypingStop, 1500);
  };

  useEffect(() => () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTypingStop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setDraft("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTypingStop();
    try {
      await onSend(content);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const callDisabled = !otherUser || callStatus !== "idle";

  const openCallLog = async () => {
    setShowCallLog(true);
    setLoadingCallLogs(true);
    try {
      const res: any = await messageApi.callLogs(conversation.id);
      setCallLogs(res.calls || []);
    } catch (err) {
      console.error("Failed to load call log:", err);
      setCallLogs([]);
    } finally {
      setLoadingCallLogs(false);
    }
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-left">
          <div className="chat-header-left-inner">
            <button onClick={onBack} aria-label="Back">
              <IoIosArrowBack />
            </button>
            {otherUser?.image ? (
              <img src={otherUser.image} alt={otherUser.fullName} />
            ) : (
              <div className="chat-avatar chat-avatar-fallback chat-header-avatar-fallback">
                {(otherUser?.fullName ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2>{otherUser?.fullName ?? "Unknown"}</h2>
            {isTyping && <p className="chat-typing-indicator">typing…</p>}
          </div>
        </div>

        <div className="chat-header-right">
          <MdHistory
            className="iconCall"
            title="Call history"
            aria-label="Call history"
            onClick={openCallLog}
          />
          <IoIosCall
            className={`iconCall ${callDisabled ? "iconCall-disabled" : ""}`}
            onClick={() => otherUser && !callDisabled && startCall(
              { id: otherUser.id, fullName: otherUser.fullName, image: otherUser.image },
              conversation.id,
              "audio",
            )}
          />
          <IoIosVideocam
            className={`iconCall ${callDisabled ? "iconCall-disabled" : ""}`}
            onClick={() => otherUser && !callDisabled && startCall(
              { id: otherUser.id, fullName: otherUser.fullName, image: otherUser.image },
              conversation.id,
              "video",
            )}
          />
        </div>
      </header>

      {/* Messages */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-empty-state">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty-state">No messages yet. Say hello 👋</div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <p key={m.id} className={`chat-line flex ${mine ? "with-you" : "with-others"}`}>
                <span className={`message-bubble ${mine ? "text-right-highlight" : "text-left-highlight"}`}>
                  {m.content}
                  <span className="message-time">{formatTime(m.createdAt)}</span>
                </span>
              </p>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Type a message"
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          aria-label="Send message"
        >
          <IoIosSend />
        </button>
      </div>

      {/* Call history modal — audit trail of every ring/accept/reject/cancel/end */}
      {showCallLog && (
        <div
          onClick={() => setShowCallLog(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(15,15,30,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 16, width: "min(420px, 92vw)",
              maxHeight: "70vh", overflow: "hidden", display: "flex", flexDirection: "column",
              boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "1rem 1.25rem", borderBottom: "1px solid #eee",
            }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontFamily: "'Sora', sans-serif" }}>Call history</h3>
              <button
                onClick={() => setShowCallLog(false)}
                aria-label="Close"
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: "#888", display: "flex" }}
              >
                <MdClose />
              </button>
            </div>
            <div style={{ overflowY: "auto", padding: "0.5rem 0.75rem" }}>
              {loadingCallLogs ? (
                <p style={{ padding: "1rem", color: "#999", fontSize: "0.9rem" }}>Loading…</p>
              ) : callLogs.length === 0 ? (
                <p style={{ padding: "1rem", color: "#999", fontSize: "0.9rem" }}>No calls yet with {otherUser?.fullName ?? "this person"}.</p>
              ) : (
                callLogs.map((c) => {
                  const outgoing = c.caller?.id === currentUserId;
                  const icon = c.status === "missed" || c.status === "canceled"
                    ? <MdCallMissed color="#dc2626" />
                    : c.status === "rejected"
                    ? <MdCallEnd color="#dc2626" />
                    : <MdCall color="#16a34a" />;
                  const duration = formatDuration(c.durationSeconds);
                  return (
                    <div key={c.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "0.65rem 0.5rem", borderBottom: "1px solid #f3f3f5",
                    }}>
                      <span style={{ fontSize: "1.1rem", display: "flex" }}>{icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600, color: "#1a1740" }}>
                          {outgoing ? "Outgoing" : "Incoming"} {c.callType === "video" ? "video" : "audio"} call
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#9ca3af" }}>
                          {new Date(c.startedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                          {" · "}{callStatusLabel[c.status]}
                          {duration ? ` · ${duration}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
