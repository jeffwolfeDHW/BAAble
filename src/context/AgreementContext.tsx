/**
 * AgreementContext - Agreement management state and operations
 * Provides agreement data, CRUD operations, and agreement-related state
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Agreement, NewAgreement, AgreementVersion } from '@/types/index';
import { initialAgreements } from '@/data/mock-data';

/**
 * Agreement context type definition
 */
interface AgreementContextType {
  agreements: Agreement[];
  setAgreements: (agreements: Agreement[]) => void;
  addAgreement: (newAgreement: NewAgreement, userName: string) => Agreement;
  removeAgreement: (id: number) => void;
  updateAgreement: (id: number, agreement: Partial<Agreement>) => void;
}

/**
 * Create the agreement context
 */
const AgreementContext = createContext<AgreementContextType | undefined>(undefined);

/**
 * AgreementProvider component
 * Wraps the application and provides agreement state and operations
 */
export const AgreementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agreements, setAgreements] = useState<Agreement[]>(initialAgreements);

  /**
   * Add a new agreement
   * Creates full Agreement from NewAgreement form data
   */
  const addAgreement = useCallback(
    (newAgreement: NewAgreement, userName: string): Agreement => {
      // Generate next ID
      const nextId = agreements.length > 0 ? Math.max(...agreements.map((a) => a.id)) + 1 : 1;

      // Get today's date in ISO format
      const today = new Date().toISOString().split('T')[0];

      // Create initial version
      const initialVersion: AgreementVersion = {
        version: 1,
        date: today,
        author: userName,
        changes: 'Initial version created',
      };

      // Create full Agreement
      const agreement: Agreement = {
        id: nextId,
        name: newAgreement.name,
        type: newAgreement.type,
        counterparty: newAgreement.counterparty,
        effectiveDate: newAgreement.effectiveDate,
        expirationDate: newAgreement.expirationDate,
        status: 'draft',
        signatureStatus: 'pending',
        breachNotification: newAgreement.breachNotification,
        complianceTerms: {
          breachNotificationHours: newAgreement.breachNotification,
          auditRights: newAgreement.auditRights,
          subcontractorApproval: newAgreement.subcontractorApproval,
          dataRetention: newAgreement.dataRetention,
          terminationNotice: newAgreement.terminationNotice,
        },
        uploadDate: today,
        versions: [initialVersion],
        currentVersion: 1,
        emailAlerts: newAgreement.emailAlerts,
        extractedData: null,
      };

      // Add to agreements
      const updatedAgreements = [...agreements, agreement];
      setAgreements(updatedAgreements);

      return agreement;
    },
    [agreements]
  );

  /**
   * Remove an agreement by ID
   */
  const removeAgreement = useCallback((id: number) => {
    setAgreements((prevAgreements) => prevAgreements.filter((agreement) => agreement.id !== id));
  }, []);

  /**
   * Update an agreement by ID
   */
  const updateAgreement = useCallback((id: number, updates: Partial<Agreement>) => {
    setAgreements((prevAgreements) =>
      prevAgreements.map((agreement) =>
        agreement.id === id ? { ...agreement, ...updates } : agreement
      )
    );
  }, []);

  const value: AgreementContextType = {
    agreements,
    setAgreements,
    addAgreement,
    removeAgreement,
    updateAgreement,
  };

  return <AgreementContext.Provider value={value}>{children}</AgreementContext.Provider>;
};

/**
 * Hook to use agreement context
 * Throws error if used outside AgreementProvider
 */
export const useAgreements = (): AgreementContextType => {
  const context = useContext(AgreementContext);
  if (context === undefined) {
    throw new Error('useAgreements must be used within an AgreementProvider');
  }
  return context;
};
