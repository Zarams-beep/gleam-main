"use client";
import ChatSidebar from "@/component/Dashboard/DashboardMessage/chatSidebar";
import ChatWindow from "@/component/Dashboard/DashboardMessage/chatWindow";
import { useState, useEffect } from "react";

export default function MessagePage() {
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat);
    if (window.innerWidth < 769) setShowSidebar(false);
  };

  const handleBack = () => {
    setSelectedChat(null);
    if (window.innerWidth < 769) setShowSidebar(true);
  };

  // Ensure correct layout if user resizes window
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 769) setShowSidebar(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="message-main-container">
      {/* Sidebar */}
      <div
        className={`show-bar-container ${
          showSidebar ? "show-bar" : "dont-show-bar"
        }`}
      >
        <ChatSidebar onSelectChat={handleSelectChat} />
      </div>

      {/* Chat Window */}
      <div
        className={`show-chat-main ${
          showSidebar ? "show-chat" : "dont-show-chat"
        }`}
      >
        {selectedChat ? (
          <ChatWindow chat={selectedChat} onBack={handleBack} />
        ) : (
          <div className="chat-not-selected">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
