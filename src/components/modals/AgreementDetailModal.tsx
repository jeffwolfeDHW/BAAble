/**
 * AgreementDetailModal - Displays comprehensive agreement details and compliance information
 * Shows overview, compliance terms, extraction metadata, and action buttons
 */

import React from 'react';
import {
  Zap,
  CheckCircle,
  Clock,
  Bell,
  History,
  FileSignature,
  Download,
  Mail,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { Agreement } from '@/types/index';
import {
  formatDate,
  getAgreementTypeLabel,
  getAgreementTypeBgClass,
  getAgreementTypeTextClass,
  getSignatureStatusLabel,
  formatHoursDuration,
} from '@/utils/agreement-helpers';

interface AgreementDetailModalProps {
  agreement: Agreement | null;
  onClose: () => void;
  onViewHistory?: () => void;
  onESignature?: () => void;
}

const AgreementDetailModal: React.FC<AgreementDetailModalProps> = ({
  agreement,
  onClose,
  onViewHistory,
  onESignature,
}) => {
  if (!agreement) {
    return null;
  }

  const typeLabel = getAgreementTypeLabel(agreement.type);
  const typeClass = getAgreementTypeTextClass(agreement.type);
  const typeBgClass = getAgreementTypeBgClass(agreement.type);

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

  const signatureStatus = getSignatureStatusInfo();
  const alertsEnabled = agreement.emailAlerts;

  return (
    <Modal
      isOpen={agreement !== null}
      onClose={onClose}
      title={agreement.name}
      subtitle={`Counterparty: ${agreement.counterparty}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex gap-3 w-full">
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
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
            <Download className="w-4 h-4" />
            Download
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium ml-auto">
            <Mail className="w-4 h-4" />
            Email Alerts
          </button>
        </div>
      }
    >
      <div className="space-y-6">
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
              <Badge variant={agreement.type === 'covered-entity' ? 'blue' : agreement.type === 'business-associate' ? 'green' : 'purple'} size="sm">
                {typeLabel}
              </Badge>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 uppercase">Status</p>
              <p className="font-semibold text-gray-900 mt-2 capitalize">{agreement.status}</p>
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
              <div className="flex items-center gap-2 mt-2">
                {alertsEnabled ? (
                  <>
                    <Bell className="w-4 h-4 text-blue-600" />
                    <p className="font-semibold text-gray-900">Enabled</p>
                  </>
                ) : (
                  <p className="font-semibold text-gray-500">Disabled</p>
                )}
              </div>
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
