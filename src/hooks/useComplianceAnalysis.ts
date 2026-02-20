/**
 * useComplianceAnalysis - Custom hook for compliance analysis
 * Analyzes agreements and returns compliance issues with statistics
 */

import { useMemo } from 'react';
import { Agreement, ComplianceIssue } from '@/types/index';
import { analyzeCompliance } from '@/utils/compliance';

/**
 * Result type for compliance analysis hook
 */
export interface ComplianceAnalysisResult {
  issues: ComplianceIssue[];
  criticalCount: number;
  warningCount: number;
  hasIssues: boolean;
}

/**
 * Hook to analyze agreements for compliance issues
 * Memoized for performance optimization
 *
 * @param agreements - Array of agreements to analyze
 * @returns Compliance analysis result with issues and statistics
 */
export const useComplianceAnalysis = (agreements: Agreement[]): ComplianceAnalysisResult => {
  return useMemo(() => {
    // Run compliance analysis
    const issues = analyzeCompliance(agreements);

    // Count issues by severity
    const criticalCount = issues.filter((issue) => issue.type === 'critical').length;
    const warningCount = issues.filter((issue) => issue.type === 'warning').length;

    return {
      issues,
      criticalCount,
      warningCount,
      hasIssues: issues.length > 0,
    };
  }, [agreements]);
};
