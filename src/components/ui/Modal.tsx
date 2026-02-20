/**
 * Modal component - Reusable modal wrapper for dialogs and forms
 * Supports header with gradient, scrollable body, and footer section
 */

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerGradient?: string;
  footer?: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  headerGradient = 'from-indigo-600 to-purple-600',
  footer,
  maxWidth = 'max-w-2xl',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full mx-4 max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${headerGradient} text-white p-6 flex justify-between items-start`}>
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {subtitle && <p className="text-sm text-indigo-100 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
