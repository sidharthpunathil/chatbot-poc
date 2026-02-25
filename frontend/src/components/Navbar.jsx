import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Menu, X } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <Link to="/" className="flex items-center gap-2 no-underline">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
          <MessageCircle size={16} className="text-white" />
        </div>
        <h2 className="font-bold text-xl text-gray-900">
          College<span className="text-violet-600">Chat</span>
        </h2>
      </Link>

      {/* Desktop nav links */}
      <ul className="hidden md:flex gap-8 list-none">
        <li>
          <Link to="/" className="text-gray-500 no-underline font-medium hover:text-violet-600 transition-colors">Home</Link>
        </li>
        <li>
          <a href="/#about" className="text-gray-500 no-underline font-medium hover:text-violet-600 transition-colors">About</a>
        </li>
        <li>
          <a href="/#faq" className="text-gray-500 no-underline font-medium hover:text-violet-600 transition-colors">FAQ</a>
        </li>
        <li>
          <Link to="/admin" className="text-gray-500 no-underline font-medium hover:text-violet-600 transition-colors">Dashboard</Link>
        </li>
      </ul>

      <Link
        to="/chat"
        className="hidden md:inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl no-underline font-semibold text-sm hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-300/40 hover:scale-[1.02] transition-all duration-200"
      >
        <MessageCircle size={15} />
        Start Chat
      </Link>

      {/* Mobile hamburger */}
      <button
        className="md:hidden bg-transparent border-none cursor-pointer text-gray-700"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 flex flex-col items-center gap-4 py-6 md:hidden z-50">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-gray-600 no-underline font-medium hover:text-violet-600 transition-colors">Home</Link>
          <a href="/#about" onClick={() => setMenuOpen(false)} className="text-gray-600 no-underline font-medium hover:text-violet-600 transition-colors">About</a>
          <a href="/#faq" onClick={() => setMenuOpen(false)} className="text-gray-600 no-underline font-medium hover:text-violet-600 transition-colors">FAQ</a>
          <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-gray-600 no-underline font-medium hover:text-violet-600 transition-colors">Dashboard</Link>
          <Link
            to="/chat"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-xl no-underline font-semibold text-sm"
          >
            <MessageCircle size={15} />
            Start Chat
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
