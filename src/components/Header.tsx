import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSearch } from '../hooks/useSearch';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { query, setQuery } = useSearch();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-black/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <img 
              src="/favicon.png" 
              alt="FEChannel TV"
              className="h-10 w-10"
            />
            <div className="hidden md:block">
              <div className="text-red-500 font-bold text-xl">
                FEChannel
              </div>
              <div className="text-white text-xs opacity-80">
                Flat Earth TV
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link 
              to="/"
              className="text-white hover:text-red-500 transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/categories/documentaries"
              className="text-white hover:text-red-500 transition-colors"
            >
              Documentaries
            </Link>
            <Link 
              to="/categories/interviews"
              className="text-white hover:text-red-500 transition-colors"
            >
              Interviews
            </Link>
            <Link 
              to="/categories/educational"
              className="text-white hover:text-red-500 transition-colors"
            >
              Educational
            </Link>
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search videos..."
                    className="bg-gray-800 text-white px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-r-md hover:bg-red-700 transition-colors"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-white hover:text-red-500 transition-colors"
                  title="Search videos"
                >
                  <Search className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Mobile Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden text-white hover:text-red-500 transition-colors"
            >
              <Search className="h-6 w-6" />
            </button>

            {/* Admin/User Menu */}
            {isAuthenticated && isAdmin && (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-white hover:text-red-500 transition-colors">
                  <User className="h-6 w-6" />
                  <span className="hidden md:inline">Admin</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-700">
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-t-md"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-b-md"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white hover:text-red-500 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-800">
            <div className="space-y-2">
              <Link 
                to="/"
                className="block px-4 py-2 text-white hover:text-red-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/categories/documentaries"
                className="block px-4 py-2 text-white hover:text-red-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Documentaries
              </Link>
              <Link 
                to="/categories/interviews"
                className="block px-4 py-2 text-white hover:text-red-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Interviews
              </Link>
              <Link 
                to="/categories/educational"
                className="block px-4 py-2 text-white hover:text-red-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Educational
              </Link>
            </div>
          </nav>
        )}

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search videos..."
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
              />
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
