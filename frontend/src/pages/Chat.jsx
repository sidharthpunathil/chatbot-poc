import React, { useState } from "react";
import { useNavigate } from "react-router-dom";   // ✅ ADDED
import "./Chat.css";

const Chat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const navigate = useNavigate();                 // ✅ ADDED

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I’m your College Assistant. How can I help you today?",
    },
  ]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
  };

  return (
    <div className="chat-page">
      {/* SIDEBAR */}
      <aside className={`chat-sidebar ${sidebarOpen ? "" : "closed"}`}>
        <h3>Chatbot</h3>

        {/* ✅ ONLY onClick ADDED */}
        <button>New chat</button>
        <button onClick={() => navigate("/recentchat")}>Recent chat</button>
        <button onClick={() => navigate("/faq")}>FAQ</button>
        <button onClick={() => navigate("/about")}>About</button>
      </aside>

      {/* MAIN CHAT */}
      <div className={`chat-main ${sidebarOpen ? "" : "full"}`}>
        {/* HEADER */}
        <div className="chat-header">
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <span>College Chatbot</span>
        </div>

        {/* CHAT BODY */}
        <div className="chat-body">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        {/* INPUT BAR */}
        
        <form className="chat-input" onSubmit={sendMessage}>
          <button type="button" className="upload-btn">
            +
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button type="submit" className="send-btn">
            ▶
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
