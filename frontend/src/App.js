import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import About from "./pages/About";
import FAQ from "./pages/Faq";

import HomeLayout from "./components/HomeLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home WITH header & footer */}
        <Route
          path="/"
          element={
            <HomeLayout>
              <Home />
            </HomeLayout>
          }
        />

        {/* Pages WITHOUT header & footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Optional: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
