import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat API
export const chatAPI = {
  sendMessage: async (message, sessionId = null, collectionName = 'default', config = {}) => {
    const response = await api.post('/chat/', {
      message,
      session_id: sessionId,
      collection_name: collectionName,
      ...config,
    });
    return response.data;
  },

  getHistory: async (sessionId) => {
    const response = await api.get(`/chat/history/${sessionId}`);
    return response.data;
  },

  createSession: async (userId = null, metadata = {}) => {
    const response = await api.post('/chat/session', {
      user_id: userId,
      metadata,
    });
    return response.data;
  },

  deleteSession: async (sessionId) => {
    const response = await api.delete(`/chat/session/${sessionId}`);
    return response.data;
  },

  listSessions: async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
  },
};

// Document API
export const documentAPI = {
  uploadDocument: async (file, collectionName = 'default', metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collection_name', collectionName);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  embedText: async (content, title, metadata = {}, collectionName = 'default') => {
    const response = await api.post('/documents/embed', {
      content,
      title,
      metadata,
      collection_name: collectionName,
    });
    return response.data;
  },

  listDocuments: async (collectionName = 'default', limit = 100) => {
    const response = await api.get(`/documents/?collection_name=${collectionName}&limit=${limit}`);
    return response.data;
  },

  getDocument: async (docId, collectionName = 'default') => {
    const response = await api.get(`/documents/${docId}?collection_name=${collectionName}`);
    return response.data;
  },

  deleteDocument: async (docId, collectionName = 'default') => {
    const response = await api.delete(`/documents/${docId}?collection_name=${collectionName}`);
    return response.data;
  },

  listCollections: async () => {
    const response = await api.get('/documents/collections/list');
    return response.data;
  },

  createCollection: async (name, metadata = {}, overwrite = false) => {
    const response = await api.post('/documents/collections/create', {
      name,
      metadata,
      overwrite,
    });
    return response.data;
  },

  deleteCollection: async (name) => {
    const response = await api.delete(`/documents/collections/${name}`);
    return response.data;
  },
};

export default api;
