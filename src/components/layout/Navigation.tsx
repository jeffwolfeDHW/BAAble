/**
 * Navigation component - Tab navigation for BAAble sections
 * Displays 5 main navigation tabs with icons
 */

import React from 'react';
import { Zap, FileText, Shield, Users, FileSignature } from 'lucide-react';
import { TabId } from '@/types/index';

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <Zap className="w-5 h-5" /> },
    { id: 'agreements', label: 'Agreements', icon: <FileText className="w-5 h-5" /> },
    { id: 'compliance', label: 'Compliance', icon: <Shield className="w-5 h-5" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-5 h-5" /> },
    { id: 'templates', label: 'Templates', icon: <FileSignature className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-2 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-600 border-transparent hover:text-indigo-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
