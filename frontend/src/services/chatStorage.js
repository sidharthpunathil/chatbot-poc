const BROWSER_ID_KEY = "chatbot_browser_id";
const CHATS_KEY = "chatbot_recent_chats";
const CURRENT_SESSION_KEY = "chatbot_current_session";

export function getBrowserId() {
  let id = localStorage.getItem(BROWSER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(BROWSER_ID_KEY, id);
  }
  return id;
}

export function getRecentChats() {
  try {
    return JSON.parse(localStorage.getItem(CHATS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveChat(sessionId, title, lastMessage, messages) {
  const chats = getRecentChats();
  const existing = chats.findIndex((c) => c.sessionId === sessionId);
  const entry = {
    sessionId,
    title,
    lastMessage,
    messages,
    updatedAt: Date.now(),
  };
  if (existing !== -1) {
    chats[existing] = entry;
  } else {
    chats.unshift(entry);
  }
  // keep last 50 chats
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats.slice(0, 50)));
}

export function deleteChat(sessionId) {
  const chats = getRecentChats().filter((c) => c.sessionId !== sessionId);
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

export function getChatBySession(sessionId) {
  return getRecentChats().find((c) => c.sessionId === sessionId) || null;
}

export function setCurrentSession(sessionId) {
  localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
}

export function getCurrentSession() {
  return localStorage.getItem(CURRENT_SESSION_KEY);
}
