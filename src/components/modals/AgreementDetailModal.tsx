/**
 * AgreementDetailModal - Displays and edits comprehensive agreement details
 * Shows overview, compliance terms, extraction metadata, and action buttons with edit mode
 */

import React, { useState } from 'react';
import {
  Zap,
  CheckCircle,
  Clock,
  Bell,
  History,
  FileSignature,
  Download,
  Edit2,
  Save,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { Agreement, AgreementStatus } from '@/types/index';
import {
  formatDate,
  getAgreementTypeLabel,
  getAgreementTypeBgClass,
  getAgreementTypeTextClass,
  getSignatureStatusLabel,
  formatHoursDuration,
} from '@/utils/agreement-helpers';
import { useAgreements } from '@/context/AgreementContext';

interface AgreementDetailModalProps {
  agreement: Agreement | null;
  onClose: () => void;
  onViewHistory?: () => void;
  onESignature?: () => void;
  onEdit?: () => void;
}

const AgreementDetailModal: React.FC<AgreementDetailModalProps> = ({
  agreement,
  onClose,
  onViewHistory,
  onESignature,
  onEdit,
}) => {
  const { updateAgreement, removeAgreement, isLoading } = useAgreements();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(agreement?.emailAlerts ?? true);
  const [selectedStatus, setSelectedStatus] = useState<AgreementStatus>(agreement?.status ?? 'draft');
  const [error, setError] = useState<string | null>(null);

  if (!agreement) {
    return null;
  }

  const typeLabel = getAgreementTypeLabel(agreement.type);

  /**
   * Get signature status badge info
   */
  const getSignatureStatusInfo = () => {
    switch (agreement.signatureStatus) {
      case 'fully-executed':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Fully Executed',
          bgClass: 'bg-green-100',
          textClass: 'text-green-800',
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Pending Signature',
          bgClass: 'bg-orange-100',
          textClass: 'text-orange-800',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Unsigned',
          bgClass: 'bg-red-100',
          textClass: 'text-red-800',
        };
    }
  };

  /**
   * Handle save changes
   */
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateAgreement(agreement.id, {
        status: selectedStatus,
        emailAlerts: emailAlertsEnabled,
      });
      setIsEditMode(false);
      console.log('Agreement updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle delete agreement
   */
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await removeAgreement(agreement.id);
      console.log('Agreement deleted successfully');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete agreement');
      setIsDeleting(false);
    }
  };

  /**
   * Handle toggle email alerts
   */
  const handleToggleAlerts = () => {
    setEmailAlertsEnabled(!emailAlertsEnabled);
  };

  /**
   * Handle download (placeholder)
   */
  const handleDownload = () => {
    console.log('Download placeholder - coming soon');
  };

  const signatureStatus = getSignatureStatusInfo();

  return (
    <Modal
      isOpen={agreement !== null}
      onClose={onClose}
      title={agreement.name}
      subtitle={`Counterparty: ${agreement.counterparty}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex gap-3 w-full flex-wrap">
          {!isEditMode ? (
            <>
              <button
                onClick={onViewHistory}
                className="flex items-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
              >
                <History className="w-4 h-4" />
                Version History
              </button>
              <button
                onClick={onESignature}
                className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                <FileSignature className="w-4 h-4" />
                E-Signature
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium ml-auto"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditMode(false)}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium ml-auto"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-900 mb-3">
              Are you sure you want to delete "{agreement.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Agreement
              </button>
            </div>
          </div>
        )}

        {/* Extraction Info */}
        {agreement.extractedData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-900">Extracted Data</p>
              <p className="text-sm text-blue-700">
                {agreement.extractedData.method} - {agreement.extractedData.confidence}% confidence
              </p>
            </div>
            <Badge variant="blue" size="sm">
              v{agreement.currentVersion}
            </Badge>
          </div>
        )}

        {/* Agreement Overview */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Agreement Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase">Type</p>
              <Badge
                variant={
                  agreement.type === 'covered-entity' ? 'blue' : agreement.type === 'business-associate' ? 'green' : 'purple'
                }
                size="sm"
              >
                {typeLabel}
              </Badge>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase">Status</p>
              {isEditMode ? (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as AgreementStatus)}
                  className="mt-2 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              ) : (
                <p className="font-semibold text-gray-900 mt-2 capitalize">{agreement.status}</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase">Effective Date</p>
              <p className="font-semibold text-gray-900 mt-2">{formatDate(agreement.effectiveDate)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase">Expiration Date</p>
              <p className="font-semibold text-gray-900 mt-2">{formatDate(agreement.expirationDate)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase">Signature Status</p>
              <div className="flex items-center gap-2 mt-2">
                {signatureStatus.icon}
                <p className="font-semibold text-gray-900">{signatureStatus.text}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase">Email Alerts</p>
              {isEditMode ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="emailAlerts"
                    checked={emailAlertsEnabled}
                    onChange={handleToggleAlerts}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  />
                  <label htmlFor="emailAlerts" className="text-sm font-medium text-gray-700">
                    {emailAlertsEnabled ? 'Enabled' : 'Disabled'}
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  {emailAlertsEnabled ? (
                    <>
                      <Bell className="w-4 h-4 text-blue-600" />
                      <p className="font-semibold text-gray-900">Enabled</p>
                    </>
                  ) : (
                    <p className="font-semibold text-gray-500">Disabled</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compliance Terms */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Compliance Terms</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">Breach Notification</span>
              <span className="font-semibold text-gray-900">
                {formatHoursDuration(agreement.complianceTerms.breachNotificationHours)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">Audit Rights</span>
              <span className="font-semibold text-gray-900">
                {agreement.complianceTerms.auditRights ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">Subcontractor Approval</span>
              <span className="font-semibold text-gray-900 capitalize">
                {agreement.complianceTerms.subcontractorApproval.replace('-', ' ')}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">Data Retention</span>
              <span className="font-semibold text-gray-900">
                {agreement.complianceTerms.dataRetention}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700">Termination Notice</span>
              <span className="font-semibold text-gray-900">
                {agreement.complianceTerms.terminationNotice} days
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AgreementDetailModal;
