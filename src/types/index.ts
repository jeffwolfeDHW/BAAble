/**
 * BAAble - BAA/Business Associate Agreement Management Platform
 * TypeScript types and interfaces for HIPAA compliance
 */

/**
 * User role type for access control
 */
export type UserRole = 'admin' | 'internal' | 'external-counsel';

/**
 * User representing a team member in the system
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  company: string;
}

/**
 * Subcontractor approval requirement type
 */
export type SubcontractorApprovalType = 'required' | 'notification' | 'not-applicable';

/**
 * Compliance terms specific to a BAA
 */
export interface ComplianceTerms {
  /** Hours within which breach must be notified */
  breachNotificationHours: number;
  /** Whether agreement includes audit rights */
  auditRights: boolean;
  /** How subcontractors must be handled */
  subcontractorApproval: SubcontractorApprovalType;
  /** Data retention period (e.g., "7 years", "Until service termination") */
  dataRetention: string;
  /** Days notice required for termination */
  terminationNotice: number;
}

/**
 * Version history entry for agreement
 */
export interface AgreementVersion {
  version: number;
  date: string; // ISO 8601 format
  author: string;
  changes: string;
}

/**
 * Metadata about extracted data from agreement document
 */
export interface ExtractedData {
  /** Confidence score 0-100 */
  confidence: number;
  /** Extraction method (e.g., "AI", "OCR+AI", "Manual") */
  method: string;
}

/**
 * Agreement type for BAA management
 */
export type AgreementType = 'covered-entity' | 'business-associate' | 'subcontractor';

/**
 * Signature status of agreement
 */
export type SignatureStatus = 'fully-executed' | 'pending' | 'unsigned';

/**
 * Status of agreement
 */
export type AgreementStatus = 'active' | 'expired' | 'draft';

/**
 * Main Agreement entity
 */
export interface Agreement {
  id: number;
  name: string;
  type: AgreementType;
  /** Name of the counterparty organization */
  counterparty: string;
  /** Effective date in ISO 8601 format */
  effectiveDate: string;
  /** Expiration date in ISO 8601 format */
  expirationDate: string;
  status: AgreementStatus;
  signatureStatus: SignatureStatus;
  /** Breach notification requirement in hours */
  breachNotification: number;
  /** Compliance terms specific to this agreement */
  complianceTerms: ComplianceTerms;
  /** When document was uploaded in ISO 8601 format */
  uploadDate: string;
  /** Version history */
  versions: AgreementVersion[];
  /** Current active version number */
  currentVersion: number;
  /** Whether email alerts are enabled for this agreement */
  emailAlerts: boolean;
  /** Data extracted from the document via AI/OCR */
  extractedData: ExtractedData | null;
}

/**
 * Team member with access control
 */
export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

/**
 * Compliance issue found during analysis
 */
export type ComplianceIssueSeverity = 'critical' | 'warning';

export interface ComplianceIssue {
  type: ComplianceIssueSeverity;
  category: string;
  description: string;
  recommendation: string;
  affectedAgreements: string[]; // Agreement names
}

/**
 * Form state for creating/editing an agreement
 */
export interface NewAgreement {
  name: string;
  type: AgreementType;
  counterparty: string;
  effectiveDate: string;
  expirationDate: string;
  breachNotification: number;
  auditRights: boolean;
  subcontractorApproval: SubcontractorApprovalType;
  dataRetention: string;
  terminationNotice: number;
  emailAlerts: boolean;
}

/**
 * Navigation tabs in the application
 */
export type TabId = 'dashboard' | 'agreements' | 'compliance' | 'team' | 'templates';

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
