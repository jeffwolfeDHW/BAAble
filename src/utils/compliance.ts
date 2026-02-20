/**
 * Compliance analysis utilities for HIPAA BAA management
 */

import { Agreement, ComplianceIssue } from '@/types/index';

/**
 * Analyzes a set of agreements for compliance issues
 * Checks for:
 * - Breach notification cascading conflicts (subcontractor hours > parent BA hours)
 * - Agreements expiring within 90 days
 * - Missing audit rights
 * - Subcontractor approval requirements
 *
 * @param agreements - Array of agreements to analyze
 * @returns Array of compliance issues found
 */
export function analyzeCompliance(agreements: Agreement[]): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  // Check for breach notification cascading conflicts
  const businessAssociates = agreements.filter((a) => a.type === 'business-associate');
  const subcontractors = agreements.filter((a) => a.type === 'subcontractor');

  // For each subcontractor, check if breach notification hours exceed any business-associate
  for (const subcontractor of subcontractors) {
    for (const ba of businessAssociates) {
      if (subcontractor.breachNotification > ba.breachNotification) {
        issues.push({
          type: 'critical',
          category: 'Breach Notification Cascade',
          description: `${subcontractor.name} has breach notification requirement of ${subcontractor.breachNotification} hours, which exceeds the ${ba.name} requirement of ${ba.breachNotification} hours.`,
          recommendation: `Ensure subcontractor breach notification hours (${subcontractor.breachNotification}h) do not exceed parent BA requirements (${ba.breachNotification}h). Update ${subcontractor.name} to comply with stricter timelines.`,
          affectedAgreements: [subcontractor.name, ba.name],
        });
      }
    }
  }

  // Check for agreements expiring within 90 days
  const today = new Date();
  const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  for (const agreement of agreements) {
    const expirationDate = new Date(agreement.expirationDate);

    if (expirationDate <= ninetyDaysFromNow && expirationDate > today) {
      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
      );

      issues.push({
        type: daysUntilExpiration <= 30 ? 'critical' : 'warning',
        category: 'Agreement Expiration',
        description: `${agreement.name} expires in ${daysUntilExpiration} days (${agreement.expirationDate}).`,
        recommendation: `Initiate renewal process for ${agreement.name}. Review terms and begin negotiations with ${agreement.counterparty} at least 60 days before expiration.`,
        affectedAgreements: [agreement.name],
      });
    }
  }

  // Check for missing audit rights in sensitive agreements
  for (const agreement of agreements) {
    if (
      (agreement.type === 'business-associate' || agreement.type === 'subcontractor') &&
      !agreement.complianceTerms.auditRights
    ) {
      issues.push({
        type: 'warning',
        category: 'Audit Rights',
        description: `${agreement.name} does not include audit rights for ${agreement.counterparty}.`,
        recommendation: `Add audit rights clause to ${agreement.name} to enable periodic compliance verification with ${agreement.counterparty}. This is recommended for HIPAA compliance.`,
        affectedAgreements: [agreement.name],
      });
    }
  }

  // Check for subcontractors without approval requirements
  for (const agreement of agreements) {
    if (
      agreement.type === 'business-associate' &&
      agreement.complianceTerms.subcontractorApproval === 'not-applicable'
    ) {
      const hasSubcontractors = agreements.some((a) => a.type === 'subcontractor');
      if (hasSubcontractors) {
        issues.push({
          type: 'warning',
          category: 'Subcontractor Management',
          description: `${agreement.name} has subcontractor approval set to "not-applicable" but your organization uses subcontractors.`,
          recommendation: `Update ${agreement.name} to require subcontractor notification or approval to maintain HIPAA compliance oversight.`,
          affectedAgreements: [agreement.name],
        });
      }
    }
  }

  // Sort issues by severity (critical first)
  issues.sort((a, b) => {
    if (a.type === 'critical' && b.type !== 'critical') return -1;
    if (a.type !== 'critical' && b.type === 'critical') return 1;
    return 0;
  });

  return issues;
}

/**
 * Gets the number of days until an agreement expires
 *
 * @param expirationDate - Expiration date in ISO 8601 format
 * @returns Number of days until expiration (negative if already expired)
 */
export function getDaysUntilExpiration(expirationDate: string): number {
  const today = new Date();
  const expiration = new Date(expirationDate);
  return Math.ceil((expiration.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Checks if an agreement is expiring soon
 *
 * @param expirationDate - Expiration date in ISO 8601 format
 * @param thresholdDays - Number of days to consider "soon" (default: 90)
 * @returns Boolean indicating if agreement expires soon
 */
export function isExpiringsoon(expirationDate: string, thresholdDays: number = 90): boolean {
  return getDaysUntilExpiration(expirationDate) <= thresholdDays;
}

/**
 * Checks if an agreement is expired
 *
 * @param expirationDate - Expiration date in ISO 8601 format
 * @returns Boolean indicating if agreement is expired
 */
export function isExpired(expirationDate: string): boolean {
  return getDaysUntilExpiration(expirationDate) < 0;
}

/**
 * Calculates compliance score for a single agreement (0-100)
 * Factors: fully executed, not expired, has audit rights, has appropriate breach notification
 *
 * @param agreement - Agreement to score
 * @returns Compliance score 0-100
 */
export function calculateAgreementComplianceScore(agreement: Agreement): number {
  let score = 100;

  // Deduct for not fully executed
  if (agreement.signatureStatus !== 'fully-executed') {
    score -= 25;
  }

  // Deduct for expired
  if (agreement.status === 'expired') {
    score -= 30;
  }

  // Deduct for expiring soon
  if (isExpiringsoon(agreement.expirationDate, 30)) {
    score -= 15;
  }

  // Deduct for missing audit rights on sensitive agreements
  if (
    (agreement.type === 'business-associate' || agreement.type === 'subcontractor') &&
    !agreement.complianceTerms.auditRights
  ) {
    score -= 10;
  }

  // Deduct for unreasonable breach notification (more than 72 hours is concerning for HIPAA)
  if (agreement.breachNotification > 72) {
    score -= 10;
  }

  return Math.max(0, score);
}

/**
 * Gets overall compliance health across all agreements
 *
 * @param agreements - Array of agreements
 * @returns Overall compliance score 0-100
 */
export function calculateOverallComplianceScore(agreements: Agreement[]): number {
  if (agreements.length === 0) return 100;

  const totalScore = agreements.reduce(
    (sum, agreement) => sum + calculateAgreementComplianceScore(agreement),
    0
  );

  return Math.round(totalScore / agreements.length);
}
