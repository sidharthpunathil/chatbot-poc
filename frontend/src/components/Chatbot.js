import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { chatAPI } from '../services/api';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollection] = useState('default');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Create a new session when component mounts
    createNewSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = async () => {
    try {
      const response = await chatAPI.createSession();
      setSessionId(response.session_id);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };


  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(input, sessionId, selectedCollection);
      
      const botMessage = {
        type: 'bot',
        text: response.response,
        timestamp: new Date().toISOString(),
        sources: response.sources || [],
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  const handleNewChat = () => {
    setMessages([]);
    createNewSession();
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-left">
          <MessageCircle className="header-icon" />
          <h1>AI Chatbot</h1>
        </div>
        <div className="header-right">
          <button onClick={handleNewChat} className="new-chat-btn">
            New Chat
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <MessageCircle className="welcome-icon" />
            <h2>Welcome to AI Chatbot</h2>
            <p>Start a conversation or upload documents so the chatbot has specialized knowledge!</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              {message.sources && message.sources.length > 0 && (
                <div className="message-sources">
                  <details>
                    <summary>Sources ({message.sources.length})</summary>
                    {message.sources.map((source, idx) => (
                      <div key={idx} className="source-item">
                        <div className="source-content">{source.content}</div>
                        <div className="source-metadata">
                          {source.metadata?.title && (
                            <span>Title: {source.metadata.title}</span>
                          )}
                          {source.distance && (
                            <span>Relevance: {(1 - source.distance).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </details>
                </div>
              )}
            </div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="send-btn"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
