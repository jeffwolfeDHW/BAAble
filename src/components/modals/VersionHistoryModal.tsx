/**
 * VersionHistoryModal - Displays version history with timeline UI
 * Shows all versions with author, date, changes, download, compare, and restore options
 */

import React, { useState } from 'react';
import { History, Download, GitCompare, RotateCcw, AlertCircle } from 'lucide-react';
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
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCompareVersion, setSelectedCompareVersion] = useState<number | null>(null);
  const [showRestoreMessage, setShowRestoreMessage] = useState<number | null>(null);

  if (!agreement) {
    return null;
  }

  /**
   * Handle version comparison
   */
  const handleCompare = (versionNumber: number) => {
    setCompareMode(true);
    setSelectedCompareVersion(versionNumber);
  };

  /**
   * Handle version restore
   */
  const handleRestore = (versionNumber: number) => {
    setShowRestoreMessage(versionNumber);
    // In real implementation, would call API to restore version
    console.log(`Restore version ${versionNumber}`);
    setTimeout(() => setShowRestoreMessage(null), 2000);
  };

  /**
   * Handle download version
   */
  const handleDownloadVersion = (versionNumber: number) => {
    console.log(`Download version ${versionNumber}`);
  };

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
        {/* Header Info */}
        <div className="flex items-center gap-3 mb-6">
          <History className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {agreement.versions.length} version{agreement.versions.length !== 1 ? 's' : ''} available
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Current version: {agreement.currentVersion}
            </p>
          </div>
        </div>

        {/* Compare Mode Message */}
        {compareMode && selectedCompareVersion && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Comparing Version {selectedCompareVersion} with Current Version
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Key differences are highlighted below
              </p>
            </div>
            <button
              onClick={() => {
                setCompareMode(false);
                setSelectedCompareVersion(null);
              }}
              className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear
            </button>
          </div>
        )}

        {/* Restore Success Message */}
        {showRestoreMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900">
              Version {showRestoreMessage} has been restored as the current version
            </p>
          </div>
        )}

        {/* Versions Timeline */}
        <div className="space-y-0">
          {agreement.versions.map((version, index) => {
            const isCurrentVersion = version.version === agreement.currentVersion;
            const isComparing = compareMode && version.version === selectedCompareVersion;

            return (
              <div
                key={version.version}
                className={`flex gap-4 pb-6 ${index < agreement.versions.length - 1 ? 'border-b border-gray-200 mb-4' : ''}`}
              >
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white transition-all ${
                      isCurrentVersion
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 ring-4 ring-indigo-100'
                        : isComparing
                          ? 'bg-blue-600'
                          : 'bg-gray-300'
                    }`}
                  >
                    {version.version}
                  </div>
                  {index < agreement.versions.length - 1 && (
                    <div
                      className={`w-1 h-16 mt-2 ${
                        isCurrentVersion
                          ? 'bg-gradient-to-b from-indigo-200 to-gray-200'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>

                {/* Version Details */}
                <div className="flex-1">
                  <div
                    className={`rounded-lg p-4 border transition-all ${
                      isCurrentVersion
                        ? 'bg-indigo-50 border-indigo-200'
                        : isComparing
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {/* Version Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">Version {version.version}</h4>
                          {isCurrentVersion && (
                            <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                          {isComparing && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                              Comparing
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{version.changes}</p>
                      </div>

                      {/* Download Button */}
                      <button
                        onClick={() => handleDownloadVersion(version.version)}
                        className="flex-shrink-0 p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                        title={`Download version ${version.version}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Version Metadata */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                      <span className="font-medium">{version.author}</span>
                      <span>·</span>
                      <span>{formatDate(version.date)}</span>
                    </div>

                    {/* Action Buttons */}
                    {!isCurrentVersion && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleCompare(version.version)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white border border-indigo-200 rounded hover:bg-indigo-50 transition-colors"
                        >
                          <GitCompare className="w-3 h-3" />
                          Compare
                        </button>
                        <button
                          onClick={() => handleRestore(version.version)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-orange-600 bg-white border border-orange-200 rounded hover:bg-orange-50 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Info */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p>
            Each version represents a snapshot of the agreement at a point in time. You can compare versions to see
            what changed or restore an older version if needed.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default VersionHistoryModal;
