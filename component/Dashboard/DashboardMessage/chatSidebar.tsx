"use client";

import { FaRegPenToSquare } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { GrFormSearch } from "react-icons/gr";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { userApi, messageApi } from "@/utils/api";
import type { Conversation, OrgMember } from "@/types/auth";
import "@/styles/Dashboard.css";

type ChatSidebarProps = {
  conversations: Conversation[];
  loading: boolean;
  selectedId: string | null;
  onSelectChat: (conv: Conversation) => void;
  onStartConversation: (conv: Conversation) => void;
};

const timeAgo = (iso: string | null) => {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
};

export default function ChatSidebar({
  conversations, loading, selectedId, onSelectChat, onStartConversation,
}: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => c.otherUser?.fullName.toLowerCase().includes(q));
  }, [conversations, search]);

  const loadMembers = useCallback((q: string) => {
    setMembersLoading(true);
    userApi.search(q)
      .then((r: any) => setMembers(r.members ?? []))
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false));
  }, []);

  useEffect(() => {
    if (!showNewChat) return;
    loadMembers("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNewChat]);

  const handleMemberSearch = (q: string) => {
    setMemberQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadMembers(q), 200);
  };

  const handlePickMember = async (member: OrgMember) => {
    setStarting(member.id);
    try {
      const { conversation } = await messageApi.start(member.id) as { conversation: Conversation };
      onStartConversation(conversation);
      setShowNewChat(false);
      setMemberQuery("");
    } catch (err) {
      console.error("Failed to start conversation:", err);
    } finally {
      setStarting(null);
    }
  };

  return (
    <div className="chat-sidebar">
      <header>
        <div className="header-1">
          <h2>Chat</h2>
          <div className="header-1-icons">
            <FaRegPenToSquare onClick={() => setShowNewChat(true)} title="New conversation" />
          </div>
        </div>

        <div className="search-container">
          <GrFormSearch className="search-icon" />
          <input
            type="text"
            name="chat search"
            placeholder="Search or start a new chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="chat-container">
        {loading ? (
          <div className="chat-empty-state">Loading conversations…</div>
        ) : filtered.length === 0 ? (
          <div className="chat-empty-state">
            No conversations yet.
            <br />
            Tap <FaRegPenToSquare style={{ display: "inline", verticalAlign: "middle" }} /> to message a teammate.
          </div>
        ) : (
          filtered.map((conv) => (
            <div
              key={conv.id}
              className={`chat-item ${selectedId === conv.id ? "chat-item-active" : ""}`}
              onClick={() => onSelectChat(conv)}
            >
              {conv.otherUser?.image ? (
                <img src={conv.otherUser.image} alt={conv.otherUser.fullName} className="chat-avatar" />
              ) : (
                <div className="chat-avatar chat-avatar-fallback">
                  {(conv.otherUser?.fullName ?? "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="chat-details">
                <div className="chat-header">
                  <h4 className="chat-name">{conv.otherUser?.fullName ?? "Unknown"}</h4>
                  <span className="chat-time">{timeAgo(conv.lastMessageTime)}</span>
                </div>
                <div className="little-chat-detail">
                  <p className="chat-preview">{conv.lastMessage ?? "Say hello 👋"}</p>
                  {conv.unreadCount > 0 && <div className="unread-count">{conv.unreadCount}</div>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New conversation panel */}
      {showNewChat && (
        <div className="new-chat-overlay" onClick={() => setShowNewChat(false)}>
          <div className="new-chat-panel" onClick={(e) => e.stopPropagation()}>
            <div className="new-chat-panel-header">
              <h3>New conversation</h3>
              <IoClose onClick={() => setShowNewChat(false)} />
            </div>
            <div className="search-container">
              <GrFormSearch className="search-icon" />
              <input
                type="text"
                autoFocus
                placeholder="Search teammates by name or department"
                value={memberQuery}
                onChange={(e) => handleMemberSearch(e.target.value)}
              />
            </div>
            <div className="new-chat-member-list">
              {membersLoading ? (
                <div className="chat-empty-state">Searching…</div>
              ) : members.length === 0 ? (
                <div className="chat-empty-state">No teammates found.</div>
              ) : (
                members.map((m) => (
                  <div key={m.id} className="chat-item" onClick={() => handlePickMember(m)}>
                    {m.image ? (
                      <img src={m.image} alt={m.full_name} className="chat-avatar" />
                    ) : (
                      <div className="chat-avatar chat-avatar-fallback">{m.full_name.charAt(0).toUpperCase()}</div>
                    )}
                    <div className="chat-details">
                      <h4 className="chat-name">{m.full_name}</h4>
                      <p className="chat-preview">{m.department || "—"}</p>
                    </div>
                    {starting === m.id && <span className="chat-preview">Starting…</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
