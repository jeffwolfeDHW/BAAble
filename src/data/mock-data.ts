/**
 * Mock data for BAAble application
 * Used for development, testing, and demo purposes
 */

import {
  User,
  TeamMember,
  Agreement,
  NewAgreement,
  AgreementVersion,
} from '@/types/index';

/**
 * Default logged-in user
 * Role: Admin with full system access
 */
export const defaultUser: User = {
  id: 1,
  name: 'Sarah Johnson',
  email: 'sarah.johnson@company.com',
  role: 'admin',
  company: 'HealthTech Solutions',
};

/**
 * Initial set of agreements for the dashboard
 */
export const initialAgreements: Agreement[] = [
  {
    id: 1,
    name: 'Acme Healthcare BAA',
    type: 'business-associate',
    counterparty: 'Acme Healthcare Services Inc.',
    effectiveDate: '2024-01-15',
    expirationDate: '2026-01-15',
    status: 'active',
    signatureStatus: 'fully-executed',
    breachNotification: 24,
    complianceTerms: {
      breachNotificationHours: 24,
      auditRights: true,
      subcontractorApproval: 'required',
      dataRetention: '7 years',
      terminationNotice: 30,
    },
    uploadDate: '2024-01-10',
    versions: [
      {
        version: 1,
        date: '2023-12-01',
        author: 'Sarah Johnson',
        changes: 'Initial version drafted',
      },
      {
        version: 2,
        date: '2024-01-08',
        author: 'David Kim',
        changes: 'Added audit rights clause and subcontractor provisions',
      },
      {
        version: 3,
        date: '2024-01-15',
        author: 'Sarah Johnson',
        changes: 'Final version with all parties\' signatures',
      },
    ],
    currentVersion: 3,
    emailAlerts: true,
    extractedData: {
      confidence: 95,
      method: 'AI Extraction',
    },
  },
  {
    id: 2,
    name: 'CloudStore Subcontractor BAA',
    type: 'subcontractor',
    counterparty: 'CloudStore Data Services LLC',
    effectiveDate: '2024-02-01',
    expirationDate: '2026-02-01',
    status: 'active',
    signatureStatus: 'fully-executed',
    breachNotification: 48,
    complianceTerms: {
      breachNotificationHours: 48,
      auditRights: true,
      subcontractorApproval: 'notification',
      dataRetention: 'Until service termination',
      terminationNotice: 60,
    },
    uploadDate: '2024-01-20',
    versions: [
      {
        version: 1,
        date: '2024-01-10',
        author: 'John Chen',
        changes: 'Initial draft based on standard template',
      },
      {
        version: 2,
        date: '2024-02-01',
        author: 'Maria Garcia',
        changes: 'Executed with signature pages appended',
      },
    ],
    currentVersion: 2,
    emailAlerts: true,
    extractedData: {
      confidence: 92,
      method: 'OCR+AI',
    },
  },
];

/**
 * Initial team members with various roles
 */
export const initialTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: 2,
    name: 'John Chen',
    email: 'john.chen@company.com',
    role: 'internal',
    status: 'active',
  },
  {
    id: 3,
    name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    role: 'internal',
    status: 'active',
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david.kim@lawfirm.com',
    role: 'external-counsel',
    status: 'active',
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@legaladvisors.com',
    role: 'external-counsel',
    status: 'active',
  },
];

/**
 * Default form state for creating a new agreement
 * Populated with sensible HIPAA-compliant defaults
 */
export const defaultNewAgreement: NewAgreement = {
  name: '',
  type: 'covered-entity',
  counterparty: '',
  effectiveDate: '',
  expirationDate: '',
  breachNotification: 24,
  auditRights: true,
  subcontractorApproval: 'required',
  dataRetention: '7 years',
  terminationNotice: 30,
  emailAlerts: true,
};

/**
 * Default new agreement with all fields properly initialized
 * Use this when starting a new agreement form
 */
export function createEmptyAgreement(): NewAgreement {
  return {
    ...defaultNewAgreement,
  };
}

/**
 * Sample agreement versions for demonstration
 */
export const sampleAgreementVersions: AgreementVersion[] = [
  {
    version: 1,
    date: '2024-01-01',
    author: 'Sarah Johnson',
    changes: 'Initial draft created from template',
  },
  {
    version: 2,
    date: '2024-01-08',
    author: 'David Kim',
    changes: 'Legal review completed - added breach notification terms',
  },
  {
    version: 3,
    date: '2024-01-12',
    author: 'Maria Garcia',
    changes: 'Counterparty requested modifications to Section 5',
  },
  {
    version: 4,
    date: '2024-01-15',
    author: 'Sarah Johnson',
    changes: 'Final version with all signatures',
  },
];

/**
 * Mock extraction results for testing
 */
export const mockExtractionResults = {
  highConfidence: {
    confidence: 95,
    method: 'AI Extraction',
  },
  mediumConfidence: {
    confidence: 78,
    method: 'OCR+AI',
  },
  lowConfidence: {
    confidence: 62,
    method: 'OCR',
  },
};

/**
 * Predefined compliance terms templates
 */
export const complianceTemplates = {
  standard: {
    breachNotificationHours: 24,
    auditRights: true,
    subcontractorApproval: 'required' as const,
    dataRetention: '7 years',
    terminationNotice: 30,
  },
  strict: {
    breachNotificationHours: 12,
    auditRights: true,
    subcontractorApproval: 'required' as const,
    dataRetention: '10 years',
    terminationNotice: 60,
  },
  relaxed: {
    breachNotificationHours: 48,
    auditRights: false,
    subcontractorApproval: 'notification' as const,
    dataRetention: '3 years',
    terminationNotice: 15,
  },
};

/**
 * API endpoints reference (for future use)
 */
export const API_ENDPOINTS = {
  agreements: '/api/agreements',
  team: '/api/team',
  compliance: '/api/compliance',
  upload: '/api/upload',
  extract: '/api/extract',
  auth: '/api/auth',
};
