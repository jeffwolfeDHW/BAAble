/**
 * Header component - Top navigation bar for BAAble
 * Displays branding, tagline, current user info, and action buttons
 */

import React from 'react';
import { Zap, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onNewAgreement?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewAgreement }) => {
  const { currentUser } = useAuth();

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">BAAble</h1>
              <p className="text-sm text-indigo-100">Intelligent BAA Management & Analysis</p>
            </div>
          </div>

          {/* Right side - User info and action button */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-medium text-sm">{currentUser.name}</p>
              <p className="text-xs text-indigo-100 capitalize">{currentUser.role.replace('-', ' ')}</p>
            </div>
            <button
              onClick={onNewAgreement}
              className="bg-white text-indigo-600 font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Agreement
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
