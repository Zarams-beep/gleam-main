"use client";

import { FaRegPenToSquare } from "react-icons/fa6";
import { BsFilter } from "react-icons/bs";
import { GrFormSearch } from "react-icons/gr";
import { useState, useEffect } from "react";
import "@/styles/Dashboard.css";

type ChatListProps = {
  onSelectChat: (chat: any) => void;
};

export default function ChatSidebar({ onSelectChat }: ChatListProps) {
 const [search, setSearch] = useState("");
 const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetch('/messageJson.json')
      .then(r => r.json())
      .then(setMessages)
      .catch(console.error);
  }, []);

    return(
        <div className="chat-sidebar">

<header>

<div className="header-1">
    <h2>Chat</h2>
<div className="">
    <FaRegPenToSquare/>
    <BsFilter/>
</div></div>

<div className="search-container">
    <GrFormSearch className="search-icon"/>
    <input type="text" name="chat search" placeholder="Search or start a new chat" />
</div>

</header>

<div className="chat-container">
  {messages.map((msg) => (
    <div key={msg.id} className="chat-item" onClick={() => onSelectChat(msg)}>
      <img
        src={msg.profile_image}
        alt={msg.name}
        className="chat-avatar"
      />
      <div className="chat-details">
        <div className="chat-header">
          <h4 className="chat-name">{msg.name}</h4>
          <span className="chat-time">{msg.last_seen}</span>
        </div>
        <div className="little-chat-detail">
<p className="chat-preview">
          {msg.preview}
        </p>
{msg.unread > 0 && (
        <div className="unread-count">
          {msg.unread}
        </div>
      )}
        </div>
        
      </div>
      
    </div>
  ))}
</div>

        </div>
    )
}