import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentChats, deleteChat } from "../services/chatStorage";
import { MessageCircle, Trash2, ArrowLeft } from "lucide-react";

const RecentChat = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState(() => getRecentChats());

  const handleDelete = (sessionId) => {
    deleteChat(sessionId);
    setChats((prev) => prev.filter((c) => c.sessionId !== sessionId));
  };

  const handleResume = (sessionId) => {
    navigate(`/chat?session=${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-5 py-10">
        <button
          onClick={() => navigate("/chat")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600 bg-transparent border-none cursor-pointer mb-6 font-medium"
        >
          <ArrowLeft size={16} />
          Back to Chat
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Recent Chats</h2>
        <p className="text-sm text-gray-500 mb-8">
          Quick access to your previous conversations
        </p>

        <div className="flex flex-col gap-3">
          {chats.length === 0 ? (
            <p className="text-center text-sm text-gray-400 mt-12">
              No recent chats yet. Start a conversation!
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.sessionId}
                onClick={() => handleResume(chat.sessionId)}
                className="bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start gap-3 cursor-pointer hover:border-violet-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle size={14} className="text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {chat.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {chat.lastMessage}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {new Date(chat.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(chat.sessionId);
                  }}
                  title="Delete chat"
                  className="bg-transparent border-none cursor-pointer text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentChat;
