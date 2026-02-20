/**
 * useFileUpload - Custom hook for file upload and AI data extraction
 * Simulates file upload with OCR/AI extraction and progress tracking
 */

import { useState, useCallback } from 'react';
import { NewAgreement } from '@/types/index';

/**
 * Result type for file upload hook
 */
export interface FileUploadResult {
  uploadedFileName: string | null;
  uploadingFile: boolean;
  extractionProgress: number;
  handleFileUpload: (file: File, onComplete: (data: Partial<NewAgreement>) => void) => void;
  resetUpload: () => void;
}

/**
 * Hook to handle file upload with simulated AI extraction
 * Simulates OCR/AI extraction with progress updates
 *
 * @returns File upload state and handlers
 */
export const useFileUpload = (): FileUploadResult => {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);

  /**
   * Handle file upload and simulate extraction
   */
  const handleFileUpload = useCallback(
    (file: File, onComplete: (data: Partial<NewAgreement>) => void) => {
      // Validate file
      if (!file) {
        return;
      }

      // Set upload state
      setUploadedFileName(file.name);
      setUploadingFile(true);
      setExtractionProgress(0);

      // Simulate extraction progress
      const progressInterval = setInterval(() => {
        setExtractionProgress((prev) => {
          const nextProgress = prev + 10;

          // Complete extraction at 100%
          if (nextProgress >= 100) {
            clearInterval(progressInterval);
            setUploadingFile(false);

            // Call onComplete with extracted data
            const extractedData: Partial<NewAgreement> = {
              name: 'DataTech Services BAA',
              counterparty: 'DataTech Corporation',
              effectiveDate: new Date().toISOString().split('T')[0],
              expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              breachNotification: 24,
              auditRights: true,
              subcontractorApproval: 'required',
              dataRetention: '7 years',
              terminationNotice: 30,
            };

            onComplete(extractedData);

            return 100;
          }

          return nextProgress;
        });
      }, 300);
    },
    []
  );

  /**
   * Reset upload state
   */
  const resetUpload = useCallback(() => {
    setUploadedFileName(null);
    setUploadingFile(false);
    setExtractionProgress(0);
  }, []);

  return {
    uploadedFileName,
    uploadingFile,
    extractionProgress,
    handleFileUpload,
    resetUpload,
  };
};
