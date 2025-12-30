import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Settings } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>AI Chatbot</h2>
        </div>
        <div className="nav-menu">
          <Link 
            to="/chat" 
            className={`nav-item ${location.pathname === '/chat' ? 'active' : ''}`}
          >
            <MessageCircle size={18} />
            <span>Chat</span>
          </Link>
          <Link 
            to="/dashboard" 
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <Settings size={18} />
            <span>Dashboard</span>
          </Link>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
