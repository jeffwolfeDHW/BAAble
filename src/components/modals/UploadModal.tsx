/**
 * UploadModal - Modal for uploading and creating new agreements
 * Handles file upload with extraction progress and manual form entry
 */

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { NewAgreement } from '@/types/index';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAgreements } from '@/context/AgreementContext';
import { useAuth } from '@/context/AuthContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { addAgreement } = useAgreements();
  const { uploadedFileName, uploadingFile, extractionProgress, handleFileUpload, resetUpload } =
    useFileUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<NewAgreement>({
    name: '',
    type: 'covered-entity',
    counterparty: '',
    effectiveDate: '',
    expirationDate: '',
    breachNotification: 24,
    auditRights: true,
    subcontractorApproval: 'required',
    dataRetention: '7 years',
    terminationNotice: 30,
    emailAlerts: true,
  });

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
    if (file && file.type.match(/\.pdf|\.docx|\.doc/)) {
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
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (!formData.name || !formData.counterparty) {
      alert('Please fill in all required fields');
      return;
    }

    addAgreement(formData, currentUser.name);
    resetForm();
    onClose();
  };

  /**
   * Reset form state
   */
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'covered-entity',
      counterparty: '',
      effectiveDate: '',
      expirationDate: '',
      breachNotification: 24,
      auditRights: true,
      subcontractorApproval: 'required',
      dataRetention: '7 years',
      terminationNotice: 30,
      emailAlerts: true,
    });
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Agreement"
      subtitle="Upload a document or enter details manually"
      maxWidth="max-w-3xl"
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Add Agreement
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Upload Document</h3>
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
            />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
              <br />
              <span className="text-xs text-gray-500">PDF, DOCX, DOC up to 10MB</span>
            </p>
          </div>

          {/* Upload Progress */}
          {uploadingFile && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Extracting data...</p>
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
          {extractionProgress === 100 && !uploadingFile && uploadedFileName && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">Data extracted successfully</p>
                <p className="text-xs text-green-700">{uploadedFileName}</p>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Terms Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Compliance Terms</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                placeholder="e.g., 7 years, Until service termination"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              />
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

            <div className="flex items-center gap-3">
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

            <div className="flex items-center gap-3">
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
    </Modal>
  );
};

export default UploadModal;
