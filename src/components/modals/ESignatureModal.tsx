/**
 * ESignatureModal - Modal for initiating electronic signature workflow
 * Captures signing order and optional message for agreement execution
 */

import React, { useState } from 'react';
import { FileSignature, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { Agreement } from '@/types/index';
import { useAuth } from '@/context/AuthContext';

interface ESignatureModalProps {
  agreement: Agreement | null;
  isOpen: boolean;
  onClose: () => void;
}

const ESignatureModal: React.FC<ESignatureModalProps> = ({ agreement, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [optionalMessage, setOptionalMessage] = useState('');

  if (!agreement) {
    return null;
  }

  const handleSendForSignature = () => {
    // Handle sending for signature
    console.log('Sending for signature:', {
      agreementId: agreement.id,
      message: optionalMessage,
    });
    setOptionalMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send for E-Signature"
      subtitle={agreement.name}
      headerGradient="from-green-600 to-emerald-600"
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSendForSignature}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            Send for Signature
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Signing Order Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Signing Order</h3>

          {/* Signer 1: Current User */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                1
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase mb-1">
                    First Signer (Current User)
                  </label>
                  <p className="font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-sm text-gray-600">{currentUser.email}</p>
                </div>
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {currentUser.company}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Signer 2: Counterparty */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="bg-gray-400 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                2
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase mb-1">
                    Second Signer (Counterparty)
                  </label>
                  <p className="font-semibold text-gray-900">{agreement.counterparty}</p>
                  <p className="text-sm text-gray-600">Representative to be specified</p>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Signer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Signer email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Message Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Optional Message</h3>
          <textarea
            value={optionalMessage}
            onChange={(e) => setOptionalMessage(e.target.value)}
            placeholder="Include any message for the signers (optional)..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors resize-none"
          />
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Electronic signatures are legally binding</p>
            <p className="text-sm text-green-700 mt-1">
              Both parties will receive signing links via email. Once signed by both parties, the agreement becomes fully executed and legally binding.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ESignatureModal;
