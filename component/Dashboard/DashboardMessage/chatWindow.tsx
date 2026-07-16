"use client";
import { IoIosCall, IoIosVideocam, IoIosArrowBack, IoIosSend } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useCall } from "@/context/CallContext";
import type { ChatMessage, Conversation } from "@/types/auth";

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
    </div>
  );
}
