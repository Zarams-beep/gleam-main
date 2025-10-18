import { IoIosCall, IoIosVideocam, IoIosArrowBack } from "react-icons/io";
type ChatWindowProps = {
  chat: any;
  onBack: () => void;
};

export default function ChatWindow({ chat, onBack }: ChatWindowProps) {
  if (!chat) return null;

  return (
    <div className="chat-window">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-left">
          <div className="">
          <button
            onClick={onBack}
            className=""
          >
            <IoIosArrowBack />
          </button>
        <img
          src={chat.profile_image}
          alt={chat.name}
          className=""
        /></div>
        <h2 className="">{chat.name}</h2></div>

        <div className="chat-header-right">
            <IoIosCall className="iconCall"/>
            <IoIosVideocam className="iconCall"/>
        </div>
      </header>

      {/* Messages */}
      <div className="chat-messages">
        {chat.chat_snippet.map((line: string, i: number) => (
          <p
            key={i} className={`chat-line flex ${line.startsWith("You:") ? "with-you" : "with-others"}`}
          >
            <span className={`message-bubble ${
              line.startsWith("You:")
                ? "text-right-highlight"
                : "text-left-highlight"
            }`}>
            {line}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}
