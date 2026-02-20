/**
 * AddTeamMemberModal - Modal for adding new team members
 * Captures name, email, and role for new team member invitations
 */

import React, { useState } from 'react';
import { AlertCircle, Loader2, UserPlus } from 'lucide-react';
import Modal from '../ui/Modal';
import { UserRole } from '@/types/index';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (name: string, email: string, role: UserRole) => Promise<void>;
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'internal' as UserRole,
  });

  /**
   * Handle input change
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle add team member
   */
  const handleAddMember = async () => {
    if (!validateForm()) {
      return;
    }

    setIsAdding(true);
    setError(null);
    try {
      if (onAdd) {
        await onAdd(formData.name, formData.email, formData.role);
      }
      console.log('Team member added successfully');
      setFormData({
        name: '',
        email: '',
        role: 'internal',
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team member');
      setIsAdding(false);
    }
  };

  /**
   * Handle close
   */
  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'internal',
    });
    setValidationErrors({});
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Team Member"
      subtitle="Invite a new member to join your organization"
      maxWidth="max-w-md"
      footer={
        <>
          <button
            onClick={handleClose}
            disabled={isAdding}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMember}
            disabled={isAdding}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isAdding && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Member
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="bg-indigo-100 rounded-full p-3">
            <UserPlus className="w-6 h-6 text-indigo-600" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., John Smith"
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

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="e.g., john@example.com"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.email && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {validationErrors.email}
            </p>
          )}
        </div>

        {/* Role Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
          >
            <option value="admin">Admin</option>
            <option value="internal">Internal</option>
            <option value="external-counsel">External Counsel</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select the team member's role in your organization
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AddTeamMemberModal;
