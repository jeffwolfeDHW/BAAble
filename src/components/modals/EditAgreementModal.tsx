/**
 * EditAgreementModal - Modal for editing existing agreements
 * Allows modification of agreement details with change description
 */

import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { Agreement, AgreementStatus } from '@/types/index';
import { useAgreements } from '@/context/AgreementContext';

interface EditAgreementModalProps {
  agreement: Agreement | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditAgreementModal: React.FC<EditAgreementModalProps> = ({
  agreement,
  isOpen,
  onClose,
}) => {
  const { updateAgreement, isLoading: contextLoading } = useAgreements();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: agreement?.name || '',
    type: agreement?.type || 'covered-entity',
    counterparty: agreement?.counterparty || '',
    effectiveDate: agreement?.effectiveDate || '',
    expirationDate: agreement?.expirationDate || '',
    status: (agreement?.status || 'draft') as AgreementStatus,
    breachNotification: agreement?.complianceTerms.breachNotificationHours || 24,
    auditRights: agreement?.complianceTerms.auditRights ?? true,
    subcontractorApproval:
      agreement?.complianceTerms.subcontractorApproval || 'required',
    dataRetention: agreement?.complianceTerms.dataRetention || '7 years',
    terminationNotice: agreement?.complianceTerms.terminationNotice || 30,
    changeDescription: '',
  });

  if (!agreement) {
    return null;
  }

  /**
   * Handle input change
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';

    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Agreement name is required';
    }

    if (!formData.counterparty.trim()) {
      errors.counterparty = 'Counterparty name is required';
    }

    if (!formData.changeDescription.trim()) {
      errors.changeDescription = 'Change description is required';
    }

    if (formData.effectiveDate && formData.expirationDate) {
      if (new Date(formData.effectiveDate) >= new Date(formData.expirationDate)) {
        errors.expirationDate = 'Expiration date must be after effective date';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle save changes
   */
  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await updateAgreement(agreement.id, {
        name: formData.name,
        type: formData.type,
        counterparty: formData.counterparty,
        effectiveDate: formData.effectiveDate,
        expirationDate: formData.expirationDate,
        status: formData.status,
        complianceTerms: {
          breachNotificationHours: formData.breachNotification,
          auditRights: formData.auditRights,
          subcontractorApproval: formData.subcontractorApproval,
          dataRetention: formData.dataRetention,
          terminationNotice: formData.terminationNotice,
        },
      });
      console.log('Agreement updated successfully');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Agreement"
      subtitle={agreement.name}
      maxWidth="max-w-4xl"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isSaving || contextLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isSaving || contextLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </>
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

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agreement Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                validationErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.name && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {validationErrors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agreement Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              >
                <option value="covered-entity">Covered Entity</option>
                <option value="business-associate">Business Associate</option>
                <option value="subcontractor">Subcontractor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Counterparty <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="counterparty"
                value={formData.counterparty}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                  validationErrors.counterparty ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.counterparty && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.counterparty}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                  validationErrors.expirationDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.expirationDate && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.expirationDate}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Compliance Terms - Two Column Layout */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Compliance Terms</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breach Notification Hours
                </label>
                <input
                  type="number"
                  name="breachNotification"
                  value={formData.breachNotification}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Retention
                </label>
                <input
                  type="text"
                  name="dataRetention"
                  value={formData.dataRetention}
                  onChange={handleInputChange}
                  placeholder="e.g., 7 years"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="auditRights"
                  name="auditRights"
                  checked={formData.auditRights}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                />
                <label htmlFor="auditRights" className="text-sm font-medium text-gray-700">
                  Includes Audit Rights
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcontractor Approval
                </label>
                <select
                  name="subcontractorApproval"
                  value={formData.subcontractorApproval}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="required">Required</option>
                  <option value="notification">Notification Only</option>
                  <option value="not-applicable">Not Applicable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Termination Notice (Days)
                </label>
                <input
                  type="number"
                  name="terminationNotice"
                  value={formData.terminationNotice}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Change Description */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Change Description</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What changes are you making? <span className="text-red-500">*</span>
            </label>
            <textarea
              name="changeDescription"
              value={formData.changeDescription}
              onChange={handleInputChange}
              placeholder="e.g., Updated breach notification timeline from 48 hours to 24 hours, extended termination notice to 60 days..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none ${
                validationErrors.changeDescription ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.changeDescription && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {validationErrors.changeDescription}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              This will be recorded in the version history for audit purposes
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditAgreementModal;
