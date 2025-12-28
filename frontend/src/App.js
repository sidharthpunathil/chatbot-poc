import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import RecentChat from "./pages/RecentChat";
import Faq from "./pages/Faq";
import About from "./pages/About";

import "./App.css";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Redirect root to home */}
          <Route path="/" element={<Home />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Chat */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/recent-chat" element={<RecentChat />} />

          {/* Info */}
          <Route path="/faq" element={<Faq />} />
          <Route path="/about" element={<About />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
