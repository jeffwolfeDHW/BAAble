/**
 * UploadModal - Modal for uploading and creating new agreements
 * Handles real file upload with validation, preview, extraction progress, and form validation
 */

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { NewAgreement } from '@/types/index';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAgreements } from '@/context/AgreementContext';
import { useAuth } from '@/context/AuthContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateTerms?: Partial<NewAgreement>;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, templateTerms }) => {
  const { currentUser } = useAuth();
  const { addAgreement, isLoading: contextLoading } = useAgreements();
  const {
    fileName,
    fileSize,
    fileType,
    uploadingFile,
    extractionProgress,
    extractedData,
    error: uploadError,
    handleFileUpload,
    resetUpload,
  } = useFileUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state with template pre-fill
  const [formData, setFormData] = useState<NewAgreement>({
    name: templateTerms?.name || '',
    type: templateTerms?.type || 'covered-entity',
    counterparty: templateTerms?.counterparty || '',
    effectiveDate: templateTerms?.effectiveDate || '',
    expirationDate: templateTerms?.expirationDate || '',
    breachNotification: templateTerms?.breachNotification || 24,
    auditRights: templateTerms?.auditRights ?? true,
    subcontractorApproval: templateTerms?.subcontractorApproval || 'required',
    dataRetention: templateTerms?.dataRetention || '7 years',
    terminationNotice: templateTerms?.terminationNotice || 30,
    emailAlerts: templateTerms?.emailAlerts ?? true,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Handle file upload from input
   */
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, (extractedData) => {
        setFormData((prev) => ({
          ...prev,
          ...extractedData,
        }));
      });
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file, (extractedData) => {
        setFormData((prev) => ({
          ...prev,
          ...extractedData,
        }));
      });
    }
  };

  /**
   * Handle form input changes
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
   * Validate form data
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Agreement name is required';
    }

    if (!formData.counterparty.trim()) {
      errors.counterparty = 'Counterparty name is required';
    }

    if (formData.effectiveDate && formData.expirationDate) {
      if (new Date(formData.effectiveDate) >= new Date(formData.expirationDate)) {
        errors.expirationDate = 'Expiration date must be after effective date';
      }
    }

    if (formData.breachNotification < 1) {
      errors.breachNotification = 'Breach notification hours must be at least 1';
    }

    if (formData.terminationNotice < 1) {
      errors.terminationNotice = 'Termination notice must be at least 1 day';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addAgreement(formData, currentUser.name);
      console.log('Agreement created successfully');
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating agreement:', error);
      setValidationErrors({
        submit: error instanceof Error ? error.message : 'Failed to create agreement',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reset form state
   */
  const resetForm = () => {
    setFormData({
      name: templateTerms?.name || '',
      type: templateTerms?.type || 'covered-entity',
      counterparty: templateTerms?.counterparty || '',
      effectiveDate: templateTerms?.effectiveDate || '',
      expirationDate: templateTerms?.expirationDate || '',
      breachNotification: templateTerms?.breachNotification || 24,
      auditRights: templateTerms?.auditRights ?? true,
      subcontractorApproval: templateTerms?.subcontractorApproval || 'required',
      dataRetention: templateTerms?.dataRetention || '7 years',
      terminationNotice: templateTerms?.terminationNotice || 30,
      emailAlerts: templateTerms?.emailAlerts ?? true,
    });
    setValidationErrors({});
    resetUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Agreement"
      subtitle="Upload a document or enter details manually"
      maxWidth="max-w-4xl"
      footer={
        <>
          <button
            onClick={handleClose}
            disabled={isSubmitting || contextLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || contextLoading || uploadingFile}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Agreement
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Upload Document</h3>
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileInputChange}
              className="hidden"
              aria-label="Upload agreement document"
              disabled={uploadingFile}
            />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
              <br />
              <span className="text-xs text-gray-500">PDF, DOCX, DOC up to 10MB</span>
            </p>
          </div>

          {/* File Preview */}
          {fileName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">{fileName}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {fileSize && `Size: ${formatFileSize(fileSize)}`}
                </p>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadingFile && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <p className="text-sm font-medium text-gray-700">Extracting data...</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-300"
                  style={{ width: `${extractionProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-right">{extractionProgress}%</p>
            </div>
          )}

          {/* Success Message */}
          {extractionProgress === 100 && !uploadingFile && extractedData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Data extracted successfully</p>
                <p className="text-xs text-green-600 mt-1">
                  Fields have been pre-filled from the uploaded document
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Basic Information Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agreement Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Acme Healthcare BAA"
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
                  placeholder="Organization name"
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
          </div>
        </div>

        {/* Compliance Terms Section - Two Column Layout */}
        <div className="space-y-3">
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                    validationErrors.breachNotification ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.breachNotification && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.breachNotification}
                  </p>
                )}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
                    validationErrors.terminationNotice ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.terminationNotice && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.terminationNotice}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="emailAlerts"
                  name="emailAlerts"
                  checked={formData.emailAlerts}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                />
                <label htmlFor="emailAlerts" className="text-sm font-medium text-gray-700">
                  Enable Email Alerts
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Submission Error */}
        {validationErrors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{validationErrors.submit}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UploadModal;
