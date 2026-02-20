/**
 * AppLayout component - Main layout wrapper for the application
 * Combines Header and Navigation with gradient background
 */

import React from 'react';
import Header from './Header';
import Navigation from './Navigation';
import { TabId } from '@/types/index';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onNewAgreement?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onNewAgreement,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <Header onNewAgreement={onNewAgreement} />
      <Navigation activeTab={activeTab} onTabChange={onTabChange} />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default AppLayout;
