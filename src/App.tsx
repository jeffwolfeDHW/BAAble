/**
 * BAAble - BAA/Business Associate Agreement Management Platform
 * Main application component with routing and state management
 */

import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AgreementProvider } from './context/AgreementContext';
import { TeamProvider } from './context/TeamContext';
import { useModalState } from './hooks/useModalState';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AgreementsPage from './pages/AgreementsPage';
import CompliancePage from './pages/CompliancePage';
import TeamPage from './pages/TeamPage';
import TemplatesPage from './pages/TemplatesPage';
import UploadModal from './components/modals/UploadModal';
import AgreementDetailModal from './components/modals/AgreementDetailModal';
import EditAgreementModal from './components/modals/EditAgreementModal';
import VersionHistoryModal from './components/modals/VersionHistoryModal';
import ESignatureModal from './components/modals/ESignatureModal';
import type { TabId, Agreement, NewAgreement } from './types/index';
import type { ComplianceTermsTemplate } from './lib/api/templates';

/**
 * BAAbleApp - Main application component
 * Manages navigation, modal states, and page rendering
 */
const BAAbleApp: React.FC = () => {
  // Navigation state
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Selected agreement for detail/edit modals
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);

  // Template terms for pre-filling upload modal
  const [templateTerms, setTemplateTerms] = useState<Partial<NewAgreement> | undefined>();

  // Modal states
  const uploadModal = useModalState();
  const editModal = useModalState();
  const versionHistoryModal = useModalState();
  const eSignatureModal = useModalState();

  // Handle agreement selection (opens detail modal)
  const handleSelectAgreement = useCallback((agreement: Agreement) => {
    setSelectedAgreement(agreement);
  }, []);

  // Close detail modal
  const handleCloseDetailModal = useCallback(() => {
    setSelectedAgreement(null);
  }, []);

  // Open edit modal for an agreement
  const handleEditAgreement = useCallback(
    (agreement: Agreement) => {
      setSelectedAgreement(agreement);
      editModal.open();
    },
    [editModal]
  );

  // Open version history from detail modal
  const handleViewHistory = useCallback(() => {
    versionHistoryModal.open();
  }, [versionHistoryModal]);

  // Open e-signature from detail modal
  const handleESignature = useCallback(() => {
    eSignatureModal.open();
  }, [eSignatureModal]);

  // Open upload modal with template pre-fill
  const handleNewAgreement = useCallback(() => {
    setTemplateTerms(undefined);
    uploadModal.open();
  }, [uploadModal]);

  // Use template → open upload modal with pre-filled terms
  const handleUseTemplate = useCallback(
    (terms: ComplianceTermsTemplate) => {
      setTemplateTerms({
        breachNotification: terms.breach_notification_hours,
        auditRights: terms.audit_rights,
        subcontractorApproval: terms.subcontractor_approval ? 'required' : 'not-applicable',
        dataRetention: `${terms.data_retention_years} years`,
        terminationNotice: terms.termination_notice_days,
      });
      uploadModal.open();
    },
    [uploadModal]
  );

  // Close upload modal and clear template
  const handleCloseUpload = useCallback(() => {
    uploadModal.close();
    setTemplateTerms(undefined);
  }, [uploadModal]);

  // Navigate between tabs
  const handleNavigate = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  // Render the active page
  const renderActivePage = (): React.ReactNode => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onSelectAgreement={handleSelectAgreement}
            onNewAgreement={handleNewAgreement}
            onNavigate={handleNavigate}
          />
        );
      case 'agreements':
        return (
          <AgreementsPage
            onSelectAgreement={handleSelectAgreement}
            onEditAgreement={handleEditAgreement}
          />
        );
      case 'compliance':
        return <CompliancePage />;
      case 'team':
        return <TeamPage />;
      case 'templates':
        return <TemplatesPage onUseTemplate={handleUseTemplate} />;
      default:
        return (
          <DashboardPage
            onSelectAgreement={handleSelectAgreement}
            onNewAgreement={handleNewAgreement}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <>
      <Routes>
        <Route
          path="*"
          element={
            <>
              <AppLayout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onNewAgreement={handleNewAgreement}
              >
                {renderActivePage()}
              </AppLayout>

              {/* Upload / New Agreement Modal */}
              <UploadModal
                isOpen={uploadModal.isOpen}
                onClose={handleCloseUpload}
                templateTerms={templateTerms}
              />

              {/* Agreement Detail Modal */}
              <AgreementDetailModal
                agreement={selectedAgreement}
                onClose={handleCloseDetailModal}
                onViewHistory={handleViewHistory}
                onESignature={handleESignature}
              />

              {/* Edit Agreement Modal */}
              <EditAgreementModal
                agreement={selectedAgreement}
                isOpen={editModal.isOpen}
                onClose={editModal.close}
              />

              {/* Version History Modal */}
              <VersionHistoryModal
                agreement={selectedAgreement}
                isOpen={versionHistoryModal.isOpen}
                onClose={versionHistoryModal.close}
              />

              {/* E-Signature Modal */}
              <ESignatureModal
                agreement={selectedAgreement}
                isOpen={eSignatureModal.isOpen}
                onClose={eSignatureModal.close}
              />
            </>
          }
        />
      </Routes>
    </>
  );
};

/**
 * App - Root application component
 * Wraps everything with providers and routing
 */
const App: React.FC = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '0.5rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#f9fafb' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f9fafb' } },
          }}
        />
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected application routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AgreementProvider>
                  <TeamProvider>
                    <BAAbleApp />
                  </TeamProvider>
                </AgreementProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
