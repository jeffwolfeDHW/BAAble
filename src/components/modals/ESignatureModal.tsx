/**
 * ESignatureModal - Modal for initiating electronic signature workflow
 * Captures signers, signing order, and message for agreement execution
 */

import React, { useState } from 'react';
import { FileSignature, CheckCircle, Plus, X, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { Agreement } from '@/types/index';
import { useAuth } from '@/context/AuthContext';

interface Signer {
  id: string;
  name: string;
  email: string;
  order: number;
}

interface ESignatureModalProps {
  agreement: Agreement | null;
  isOpen: boolean;
  onClose: () => void;
}

const ESignatureModal: React.FC<ESignatureModalProps> = ({ agreement, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [signers, setSigners] = useState<Signer[]>([
    {
      id: 'signer-current',
      name: currentUser.name,
      email: currentUser.email,
      order: 1,
    },
  ]);
  const [optionalMessage, setOptionalMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!agreement) {
    return null;
  }

  /**
   * Handle adding new signer
   */
  const handleAddSigner = () => {
    const newSigner: Signer = {
      id: `signer-${Date.now()}`,
      name: '',
      email: '',
      order: signers.length + 1,
    };
    setSigners([...signers, newSigner]);
  };

  /**
   * Handle removing signer
   */
  const handleRemoveSigner = (id: string) => {
    if (id === 'signer-current') return; // Can't remove current user
    const filtered = signers.filter((s) => s.id !== id);
    setSigners(
      filtered.map((s, idx) => ({
        ...s,
        order: idx + 1,
      }))
    );
  };

  /**
   * Handle signer field change
   */
  const handleSignerChange = (id: string, field: keyof Signer, value: string) => {
    setSigners(
      signers.map((s) =>
        s.id === id
          ? { ...s, [field]: value }
          : s
      )
    );
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    setError(null);

    // Check all signers have name and email
    for (const signer of signers) {
      if (!signer.name.trim()) {
        setError(`Signer ${signer.order} name is required`);
        return false;
      }
      if (!signer.email.trim()) {
        setError(`Signer ${signer.order} email is required`);
        return false;
      }
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signer.email)) {
        setError(`Signer ${signer.order} email is invalid`);
        return false;
      }
    }

    // At least 2 signers required
    if (signers.length < 2) {
      setError('At least 2 signers are required');
      return false;
    }

    return true;
  };

  /**
   * Handle send for signature
   */
  const handleSendForSignature = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSending(true);
    try {
      // Simulate API call
      console.log('Sending for e-signature:', {
        agreementId: agreement.id,
        signers,
        message: optionalMessage,
      });

      // In real implementation, would call API to create signature requests
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('Signature request sent successfully');
      setSigners([
        {
          id: 'signer-current',
          name: currentUser.name,
          email: currentUser.email,
          order: 1,
        },
      ]);
      setOptionalMessage('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send signature request');
    } finally {
      setIsSending(false);
    }
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
            disabled={isSending}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSendForSignature}
            disabled={isSending || signers.length < 2}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
            Send for Signature
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

        {/* Signing Order Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Signing Order</h3>
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {signers.length} signer{signers.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Signers List */}
          <div className="space-y-3">
            {signers.map((signer) => (
              <div
                key={signer.id}
                className={`rounded-lg p-4 border ${
                  signer.id === 'signer-current'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                      signer.id === 'signer-current'
                        ? 'bg-green-600'
                        : 'bg-gray-400'
                    }`}
                  >
                    {signer.order}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 uppercase mb-1">
                        {signer.id === 'signer-current'
                          ? 'First Signer (You)'
                          : `Signer ${signer.order}`}
                      </label>
                      {signer.id === 'signer-current' ? (
                        <>
                          <p className="font-semibold text-gray-900">{signer.name}</p>
                          <p className="text-sm text-gray-600">{signer.email}</p>
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mt-2">
                            {currentUser.company}
                          </span>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Full name"
                            value={signer.name}
                            onChange={(e) =>
                              handleSignerChange(signer.id, 'name', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          />
                          <input
                            type="email"
                            placeholder="Email address"
                            value={signer.email}
                            onChange={(e) =>
                              handleSignerChange(signer.id, 'email', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {signer.id !== 'signer-current' && (
                    <button
                      onClick={() => handleRemoveSigner(signer.id)}
                      className="flex-shrink-0 p-1 text-gray-600 hover:bg-white rounded transition-colors"
                      aria-label={`Remove signer ${signer.order}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Signer Button */}
          <button
            onClick={handleAddSigner}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Signer
          </button>
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
              All parties will receive signing links via email. The agreement will be executed in the order specified
              above, and becomes legally binding once all signers have signed.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ESignatureModal;
