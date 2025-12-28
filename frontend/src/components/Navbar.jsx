import { Link } from "react-router-dom";
import "./Layout.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h2 className="logo">College Chatbot</h2>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/faq">FAQ</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
      </ul>

      <Link to="/chat" className="nav-btn">
        Start Chat
      </Link>
    </nav>
  );
};

export default Navbar;
