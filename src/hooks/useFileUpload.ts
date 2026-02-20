/**
 * useFileUpload - Custom hook for real file upload and AI data extraction
 * Handles file validation, storage, and simulated extraction progress
 */

import { useState, useCallback } from 'react';
import { NewAgreement } from '@/types/index';

/**
 * Result type for file upload hook
 */
export interface FileUploadResult {
  file: File | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  uploadingFile: boolean;
  extractionProgress: number;
  extractedData: Partial<NewAgreement> | null;
  error: string | null;
  handleFileUpload: (file: File, onComplete: (data: Partial<NewAgreement>) => void) => void;
  resetUpload: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

/**
 * Hook to handle real file upload with simulated AI extraction
 * Validates files, stores them, and simulates extraction with progress
 *
 * @returns File upload state and handlers
 */
export const useFileUpload = (): FileUploadResult => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<Partial<NewAgreement> | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a PDF or DOCX file.',
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 10MB.',
      };
    }

    return { valid: true };
  }, []);

  /**
   * Handle file upload and simulate extraction
   */
  const handleFileUpload = useCallback(
    (file: File, onComplete: (data: Partial<NewAgreement>) => void) => {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      // Reset error and set file state
      setError(null);
      setFile(file);
      setFileName(file.name);
      setFileSize(file.size);
      setFileType(file.type);
      setUploadingFile(true);
      setExtractionProgress(0);
      setExtractedData(null);

      // Simulate extraction progress
      const progressInterval = setInterval(() => {
        setExtractionProgress((prev) => {
          const nextProgress = prev + 10;

          // Complete extraction at 100%
          if (nextProgress >= 100) {
            clearInterval(progressInterval);
            setUploadingFile(false);

            // Generate extracted data based on filename
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            const extractedData: Partial<NewAgreement> = {
              name: nameWithoutExt || 'Uploaded Agreement',
              counterparty: 'Counterparty Organization',
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

            setExtractedData(extractedData);
            onComplete(extractedData);

            return 100;
          }

          return nextProgress;
        });
      }, 300);
    },
    [validateFile]
  );

  /**
   * Reset upload state
   */
  const resetUpload = useCallback(() => {
    setFile(null);
    setFileName(null);
    setFileSize(null);
    setFileType(null);
    setUploadingFile(false);
    setExtractionProgress(0);
    setExtractedData(null);
    setError(null);
  }, []);

  return {
    file,
    fileName,
    fileSize,
    fileType,
    uploadingFile,
    extractionProgress,
    extractedData,
    error,
    handleFileUpload,
    resetUpload,
  };
};
