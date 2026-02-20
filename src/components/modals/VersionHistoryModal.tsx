/**
 * VersionHistoryModal - Displays version history and change log for agreements
 * Shows all versions with author, date, changes, and download options
 */

import React from 'react';
import { History, Download } from 'lucide-react';
import Modal from '../ui/Modal';
import { Agreement } from '@/types/index';
import { formatDate } from '@/utils/agreement-helpers';

interface VersionHistoryModalProps {
  agreement: Agreement | null;
  isOpen: boolean;
  onClose: () => void;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  agreement,
  isOpen,
  onClose,
}) => {
  if (!agreement) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Version History"
      subtitle={agreement.name}
      maxWidth="max-w-2xl"
      footer={
        <button
          onClick={onClose}
          className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        {/* Header Icon */}
        <div className="flex items-center gap-3 mb-6">
          <History className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {agreement.versions.length} version{agreement.versions.length !== 1 ? 's' : ''} available
          </h3>
        </div>

        {/* Versions Timeline */}
        <div className="space-y-4">
          {agreement.versions.map((version, index) => {
            const isCurrentVersion = version.version === agreement.currentVersion;

            return (
              <div
                key={version.version}
                className="flex gap-4"
              >
                {/* Timeline Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                      isCurrentVersion ? 'bg-indigo-600' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {version.version}
                  </div>
                  {index < agreement.versions.length - 1 && (
                    <div className={`w-1 h-12 ${isCurrentVersion ? 'bg-indigo-200' : 'bg-gray-200'}`} />
                  )}
                </div>

                {/* Version Details */}
                <div className="flex-1 pb-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Version {version.version}
                          {isCurrentVersion && (
                            <span className="ml-2 inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{version.changes}</p>
                      </div>
                      <button
                        className="flex-shrink-0 p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                        aria-label={`Download version ${version.version}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                      <span>By {version.author}</span>
                      <span>·</span>
                      <span>{formatDate(version.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default VersionHistoryModal;
