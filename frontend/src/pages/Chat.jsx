import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Markdown from "react-markdown";
import { chatAPI } from "../services/api";
import {
  getBrowserId,
  saveChat,
  getChatBySession,
  getRecentChats,
  deleteChat,
  setCurrentSession,
  getCurrentSession,
} from "../services/chatStorage";
import {
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Clock,
  Settings,
  Home,
  Send,
  Trash2,
} from "lucide-react";

const DEFAULT_MSG = [{ sender: "bot", text: "Hi! Ask me anything about the college." }];

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesEndRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = Boolean(localStorage.getItem("access_token"));

  const [sessionId, setSessionId] = useState(null);
  const [collectionName] = useState("default");
  const [messages, setMessages] = useState(DEFAULT_MSG);
  const [recentChats, setRecentChats] = useState(() => getRecentChats());
  const browserId = useRef(getBrowserId());

  // Refresh recent chats list from storage
  const refreshRecent = () => setRecentChats(getRecentChats());

  // Create or resume a session
  useEffect(() => {
    const resumeId = searchParams.get("session") || getCurrentSession();

    const init = async () => {
      if (resumeId) {
        const saved = getChatBySession(resumeId);
        if (saved && saved.messages?.length) {
          setSessionId(resumeId);
          setMessages(saved.messages);
          setCurrentSession(resumeId);
          return;
        }
      }

      try {
        const res = await chatAPI.createSession(browserId.current);
        setSessionId(res.session_id);
        setCurrentSession(res.session_id);
      } catch (err) {
        console.error("Session creation failed", err);
      }
    };
    init();
  }, [searchParams]);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (!sessionId) return;
    const userMsgs = messages.filter((m) => m.sender === "user");
    if (userMsgs.length === 0) return;

    const title = userMsgs[0].text.slice(0, 60);
    const lastMsg = messages[messages.length - 1].text.slice(0, 100);
    saveChat(sessionId, title, lastMsg, messages);
    setCurrentSession(sessionId);
    refreshRecent();
  }, [messages, sessionId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const startNewChat = async () => {
    setMessages(DEFAULT_MSG);
    closeSidebarOnMobile();
    try {
      const res = await chatAPI.createSession(browserId.current);
      setSessionId(res.session_id);
      setCurrentSession(res.session_id);
      setSearchParams({});
    } catch (err) {
      console.error("Session creation failed", err);
    }
  };

  const switchToChat = (sid) => {
    const saved = getChatBySession(sid);
    if (saved && saved.messages?.length) {
      setSessionId(sid);
      setMessages(saved.messages);
      setCurrentSession(sid);
      setSearchParams({ session: sid });
      closeSidebarOnMobile();
    }
  };

  const handleDeleteChat = (e, sid) => {
    e.stopPropagation();
    deleteChat(sid);
    refreshRecent();
    if (sid === sessionId) startNewChat();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);

    if (!sessionId) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "\u23F3 Initializing session, please try again..." },
      ]);
      return;
    }

    try {
      setLoading(true);
      const res = await chatAPI.sendMessage(userText, sessionId, collectionName);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.answer || res.response || "No response" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "\u274C Error getting response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-gray-50 overflow-hidden relative">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-30 md:z-auto h-full bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 w-[260px] md:w-[260px] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-0"
        }`}
      >
        {/* Logo + New Chat */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <MessageCircle size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">
              College<span className="text-violet-600">Chat</span>
            </span>
          </div>

          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium border-none cursor-pointer hover:bg-violet-700 transition-colors"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        {/* Recent chats */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="flex items-center gap-2 px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <Clock size={12} />
            Recent Chats
          </p>

          {recentChats.length === 0 ? (
            <p className="px-2 text-xs text-gray-400">No conversations yet</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {recentChats.map((chat) => (
                <div
                  key={chat.sessionId}
                  onClick={() => switchToChat(chat.sessionId)}
                  className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-left ${
                    chat.sessionId === sessionId
                      ? "bg-violet-50 text-violet-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <MessageCircle size={14} className="shrink-0 opacity-50" />
                  <span className="flex-1 text-sm truncate">{chat.title}</span>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.sessionId)}
                    className="p-0.5 rounded bg-transparent border-none cursor-pointer text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="p-3 border-t border-gray-100 shrink-0 flex flex-col gap-0.5">
          <button
            onClick={() => { navigate("/"); closeSidebarOnMobile(); }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 bg-transparent border-none cursor-pointer hover:bg-violet-50 hover:text-violet-700 transition-colors text-left font-medium"
          >
            <Home size={16} />
            Home
          </button>
          {isAdmin && (
            <button
              onClick={() => { navigate("/admin"); closeSidebarOnMobile(); }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-violet-600 bg-violet-50 border-none cursor-pointer hover:bg-violet-100 transition-colors text-left font-medium"
            >
              <Settings size={16} />
              Admin Settings
            </button>
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
          <button
            className="bg-transparent border-none cursor-pointer text-gray-500 hover:text-violet-600 transition-colors p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center">
            <MessageCircle size={13} className="text-white" />
          </div>
          <span className="font-semibold text-gray-800 text-sm">College Chatbot</span>
          <span className="ml-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">
            Online
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 p-3 md:p-5 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, i) =>
              msg.sender === "bot" ? (
                <div key={i} className="flex items-start gap-2 md:gap-3">
                  <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle size={12} className="text-white" />
                  </div>
                  <div className="chat-md bg-white rounded-2xl rounded-tl-sm px-4 md:px-5 py-3 md:py-3.5 shadow-sm border border-gray-100 max-w-[85%] md:max-w-[75%]">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-end">
                  <div className="bg-violet-600 rounded-2xl rounded-tr-sm px-3 md:px-4 py-2.5 md:py-3 text-sm text-white max-w-[85%] md:max-w-[80%]">
                    {msg.text}
                  </div>
                </div>
              )
            )}
            {loading && (
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle size={12} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="p-3 md:p-4 bg-white border-t border-gray-200">
          <form
            className="max-w-3xl mx-auto flex items-center gap-2 md:gap-3"
            onSubmit={sendMessage}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-11 rounded-xl px-4 border border-gray-200 bg-gray-50 outline-none text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-11 h-11 bg-violet-600 text-white rounded-xl border-none cursor-pointer flex items-center justify-center hover:bg-violet-700 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
