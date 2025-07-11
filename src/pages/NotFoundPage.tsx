import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { SITE_CONFIG } from '../config/constants';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        {/* Logo */}
        <img 
          src={SITE_CONFIG.logo} 
          alt={SITE_CONFIG.channelName}
          className="h-20 w-auto mx-auto mb-8 opacity-75"
        />
        
        {/* Error Message */}
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to exploring our content.
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2 transition-colors w-full justify-center"
          >
            <Home className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          
          <Link
            to="/search"
            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2 transition-colors w-full justify-center"
          >
            <Search className="h-5 w-5" />
            <span>Search Videos</span>
          </Link>
        </div>
        
        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <h3 className="text-white font-medium mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <Link
              to="/categories/documentaries"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              Documentaries
            </Link>
            <Link
              to="/categories/interviews"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              Interviews
            </Link>
            <Link
              to="/categories/educational"
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              Educational Content
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}