import { useState } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  showExport?: boolean;
}

export default function Navbar({ showExport = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    // Add logout logic here if needed
    window.location.href = '/';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm">🚀🧠</span>
            </div>
            <span className="font-bold text-sm sm:text-lg hidden xs:block">AI Portfolio Companion</span>
            <span className="font-bold text-sm sm:text-lg xs:hidden">AI Coach</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <Link to="/dashboard" className="text-indigo-600 font-medium px-1 sm:px-0">Dashboard</Link>
            <Link to="/chat" className="text-gray-600 hover:text-indigo-600 transition-colors px-1 sm:px-0">Chat</Link>
            {showExport && (
              <Link to="/export" className="text-gray-600 hover:text-indigo-600 transition-colors px-1 sm:px-0">Export</Link>
            )}
            <button 
              className="px-2 py-1 border rounded hover:bg-gray-50 transition-colors text-xs sm:text-sm" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Chat
              </Link>
              {showExport && (
                <Link
                  to="/export"
                  className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Export
                </Link>
              )}
              <button
                className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
