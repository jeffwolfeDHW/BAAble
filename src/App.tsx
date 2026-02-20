/**
 * BAAble - BAA/Business Associate Agreement Management Platform
 * Main application component with routing and state management
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AgreementProvider } from './context/AgreementContext';
import { TeamProvider } from './context/TeamContext';
import { useModalState } from './hooks/useModalState';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import AgreementsPage from './pages/AgreementsPage';
import CompliancePage from './pages/CompliancePage';
import TeamPage from './pages/TeamPage';
import TemplatesPage from './pages/TemplatesPage';
import UploadModal from './components/modals/UploadModal';
import AgreementDetailModal from './components/modals/AgreementDetailModal';
import VersionHistoryModal from './components/modals/VersionHistoryModal';
import ESignatureModal from './components/modals/ESignatureModal';
import { TabId, Agreement } from './types/index';

/**
 * BAAbleApp - Main application component with routing logic
 * This is wrapped by context providers in the App component
 */
const BAAbleApp: React.FC = () => {
  // Navigation state
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Selected agreement state
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);

  // Modal states
  const uploadModal = useModalState();
  const versionHistoryModal = useModalState();
  const eSignatureModal = useModalState();

  /**
   * Handle agreement selection
   * Opens the detail modal with the selected agreement
   */
  const handleSelectAgreement = (agreement: Agreement) => {
    setSelectedAgreement(agreement);
  };

  /**
   * Handle close detail modal
   */
  const handleCloseDetailModal = () => {
    setSelectedAgreement(null);
  };

  /**
   * Handle view version history
   * Opens version history modal from detail modal
   */
  const handleViewHistory = () => {
    versionHistoryModal.open();
  };

  /**
   * Handle e-signature
   * Opens e-signature modal from detail modal
   */
  const handleESignature = () => {
    eSignatureModal.open();
  };

  /**
   * Render active page based on activeTab
   */
  const renderActivePage = (): React.ReactNode => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onSelectAgreement={handleSelectAgreement} />;
      case 'agreements':
        return <AgreementsPage onSelectAgreement={handleSelectAgreement} />;
      case 'compliance':
        return <CompliancePage />;
      case 'team':
        return <TeamPage />;
      case 'templates':
        return <TemplatesPage />;
      default:
        return <DashboardPage onSelectAgreement={handleSelectAgreement} />;
    }
  };

  return (
    <>
      <AppLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewAgreement={uploadModal.open}
      >
        {renderActivePage()}
      </AppLayout>

      {/* Modals - rendered at root level */}
      <UploadModal isOpen={uploadModal.isOpen} onClose={uploadModal.close} />

      <AgreementDetailModal
        agreement={selectedAgreement}
        onClose={handleCloseDetailModal}
        onViewHistory={handleViewHistory}
        onESignature={handleESignature}
      />

      <VersionHistoryModal
        agreement={selectedAgreement}
        isOpen={versionHistoryModal.isOpen}
        onClose={versionHistoryModal.close}
      />

      <ESignatureModal
        agreement={selectedAgreement}
        isOpen={eSignatureModal.isOpen}
        onClose={eSignatureModal.close}
      />
    </>
  );
};

/**
 * App - Root application component
 * Wraps BAAbleApp with context providers for auth, agreements, and team
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AgreementProvider>
        <TeamProvider>
          <BAAbleApp />
        </TeamProvider>
      </AgreementProvider>
    </AuthProvider>
  );
};

export default App;
