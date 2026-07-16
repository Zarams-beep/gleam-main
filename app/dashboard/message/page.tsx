"use client";
import ChatSidebar from "@/component/Dashboard/DashboardMessage/chatSidebar";
import ChatWindow from "@/component/Dashboard/DashboardMessage/chatWindow";
import { useCallback, useEffect, useRef, useState } from "react";
import { messageApi } from "@/utils/api";
import { useSocket } from "@/context/SocketContext";
import { useAppSelector } from "@/store/hooks";
import type { ChatMessage, Conversation } from "@/types/auth";

export default function MessagePage() {
  const { socket } = useSocket();
  const currentUserId = useAppSelector((s) => s.user.user?.id);

  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [loadingList, setLoadingList]       = useState(true);
  const [selected, setSelected]             = useState<Conversation | null>(null);
  const [messages, setMessages]             = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showSidebar, setShowSidebar]       = useState(true);
  const [typingFromId, setTypingFromId]     = useState<string | null>(null);

  const selectedRef = useRef<Conversation | null>(null);
  selectedRef.current = selected;

  // ─── Initial conversation list ─────────────────────────────────────────
  useEffect(() => {
    messageApi.conversations()
      .then((r: any) => setConversations(r.conversations ?? []))
      .catch(console.error)
      .finally(() => setLoadingList(false));
  }, []);

  // ─── Select a conversation → load its history + mark read ─────────────
  const openConversation = useCallback((conv: Conversation) => {
    setSelected(conv);
    setTypingFromId(null);
    if (window.innerWidth < 769) setShowSidebar(false);

    setLoadingMessages(true);
    messageApi.messages(conv.id)
      .then((r: any) => setMessages(r.messages ?? []))
      .catch(console.error)
      .finally(() => setLoadingMessages(false));

    if (conv.unreadCount > 0) {
      messageApi.markRead(conv.id).catch(() => {});
      setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)));
    }
  }, []);

  const handleStartConversation = useCallback((conv: Conversation) => {
    setConversations((prev) => (prev.some((c) => c.id === conv.id) ? prev : [conv, ...prev]));
    openConversation(conv);
  }, [openConversation]);

  const handleBack = () => {
    setSelected(null);
    if (window.innerWidth < 769) setShowSidebar(true);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 769) setShowSidebar(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Send a message (optimistic-free: append the server's own copy) ────
  const sendMessage = useCallback(async (content: string) => {
    if (!selected) return;
    const { message } = await messageApi.send(selected.id, content) as { message: ChatMessage };
    setMessages((prev) => [...prev, message]);
    setConversations((prev) => {
      const updated = prev.map((c) => (
        c.id === selected.id
          ? { ...c, lastMessage: message.content, lastMessageTime: message.createdAt, lastSenderId: message.senderId }
          : c
      ));
      // Bump the active conversation to the top, WhatsApp-style.
      const idx = updated.findIndex((c) => c.id === selected.id);
      if (idx > 0) updated.unshift(updated.splice(idx, 1)[0]);
      return updated;
    });
  }, [selected]);

  // ─── Realtime: incoming messages + typing indicators ───────────────────
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg: ChatMessage) => {
      const isActive = selectedRef.current?.id === msg.conversationId;

      if (isActive) {
        setMessages((prev) => [...prev, msg]);
        messageApi.markRead(msg.conversationId).catch(() => {});
      }

      setConversations((prev) => {
        const exists = prev.some((c) => c.id === msg.conversationId);
        if (!exists) {
          // Message from a conversation not yet in the sidebar (first message
          // from someone who started it) — refetch the list to pick it up.
          messageApi.conversations().then((r: any) => setConversations(r.conversations ?? [])).catch(() => {});
          return prev;
        }
        const updated = prev.map((c) => (
          c.id === msg.conversationId
            ? {
                ...c,
                lastMessage: msg.content,
                lastMessageTime: msg.createdAt,
                lastSenderId: msg.senderId,
                unreadCount: isActive ? 0 : c.unreadCount + 1,
              }
            : c
        ));
        const idx = updated.findIndex((c) => c.id === msg.conversationId);
        if (idx > 0) updated.unshift(updated.splice(idx, 1)[0]);
        return updated;
      });
    };

    const onTypingStart = ({ conversationId, fromUserId }: any) => {
      if (selectedRef.current?.id === conversationId) setTypingFromId(fromUserId);
    };
    const onTypingStop = ({ conversationId, fromUserId }: any) => {
      if (selectedRef.current?.id === conversationId) {
        setTypingFromId((cur) => (cur === fromUserId ? null : cur));
      }
    };

    socket.on("message:new", onMessage);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.off("message:new", onMessage);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [socket]);

  return (
    <div className="message-main-container">
      {/* Sidebar */}
      <div className={`show-bar-container ${showSidebar ? "show-bar" : "dont-show-bar"}`}>
        <ChatSidebar
          conversations={conversations}
          loading={loadingList}
          selectedId={selected?.id ?? null}
          onSelectChat={openConversation}
          onStartConversation={handleStartConversation}
        />
      </div>

      {/* Chat Window */}
      <div className={`show-chat-main ${showSidebar ? "show-chat" : "dont-show-chat"}`}>
        {selected ? (
          <ChatWindow
            conversation={selected}
            messages={messages}
            loading={loadingMessages}
            currentUserId={currentUserId}
            isTyping={!!typingFromId && typingFromId === selected.otherUser?.id}
            onBack={handleBack}
            onSend={sendMessage}
          />
        ) : (
          <div className="chat-not-selected">Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
}
