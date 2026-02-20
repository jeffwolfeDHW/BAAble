/**
 * AgreementContext - Agreement management with Supabase backend and mock fallback
 * Provides agreement data, CRUD operations, and agreement-related state
 * Bridges camelCase frontend interface with snake_case database rows
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Agreement, NewAgreement, AgreementVersion } from '@/types/index';
import { initialAgreements } from '@/data/mock-data';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  fetchAgreements,
  createAgreement as createAgreementAPI,
  updateAgreement as updateAgreementAPI,
  deleteAgreement as deleteAgreementAPI,
} from '@/lib/api/agreements';
import type { AgreementWithTerms } from '@/lib/database.types';
import { useAuth } from '@/context/AuthContext';

/**
 * Agreement context type definition
 */
interface AgreementContextType {
  agreements: Agreement[];
  setAgreements: (agreements: Agreement[]) => void;
  addAgreement: (newAgreement: NewAgreement, userName: string) => Promise<Agreement>;
  removeAgreement: (id: string | number) => Promise<void>;
  updateAgreement: (id: string | number, agreement: Partial<Agreement>) => Promise<void>;
  refreshAgreements: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Create the agreement context
 */
const AgreementContext = createContext<AgreementContextType | undefined>(undefined);

/**
 * Map database row (snake_case) to frontend Agreement (camelCase)
 */
function mapRowToAgreement(row: AgreementWithTerms): Agreement {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    counterparty: row.counterparty,
    effectiveDate: row.effective_date,
    expirationDate: row.expiration_date,
    status: row.status,
    signatureStatus: row.signature_status,
    breachNotification: row.compliance_terms?.breach_notification_hours || 72,
    complianceTerms: {
      breachNotificationHours: row.compliance_terms?.breach_notification_hours || 72,
      auditRights: row.compliance_terms?.audit_rights ?? true,
      subcontractorApproval: row.compliance_terms?.subcontractor_approval
        ? 'required'
        : 'not-applicable',
      dataRetention: `${row.compliance_terms?.data_retention_years || 6} years`,
      terminationNotice: row.compliance_terms?.termination_notice_days || 30,
    },
    uploadDate: row.created_at,
    versions: (row.versions || []).map((v) => ({
      version: v.version_number,
      date: v.created_at,
      author: v.author_name,
      changes: v.changes,
    })),
    currentVersion: row.current_version,
    emailAlerts: row.email_alerts,
    extractedData: row.extraction
      ? {
          confidence: Number(row.extraction.confidence_score),
          method: row.extraction.extraction_method,
        }
      : null,
  };
}

/**
 * AgreementProvider component
 * Wraps the application and provides agreement state and operations
 * Handles both Supabase backend and mock data fallback
 */
export const AgreementProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [agreements, setAgreements] = useState<Agreement[]>(initialAgreements);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { organization, profile } = useAuth();
  const supabaseConfigured = isSupabaseConfigured();

  /**
   * Fetch agreements from Supabase if configured, otherwise use mock data
   */
  const refreshAgreements = useCallback(async () => {
    if (!supabaseConfigured || !organization?.id) {
      // Use mock data
      setAgreements(initialAgreements);
      return;
    }

    try {
      setIsLoading(true);
      const rows = await fetchAgreements(organization.id);
      const mappedAgreements = rows.map(mapRowToAgreement);
      setAgreements(mappedAgreements);
    } catch (error) {
      console.error('Error fetching agreements:', error);
      // Fall back to mock data on error
      setAgreements(initialAgreements);
    } finally {
      setIsLoading(false);
    }
  }, [supabaseConfigured, organization?.id]);

  /**
   * Initialize agreements on mount
   */
  useEffect(() => {
    if (supabaseConfigured && organization?.id) {
      refreshAgreements();
    }
  }, [supabaseConfigured, organization?.id, refreshAgreements]);

  /**
   * Add a new agreement
   * Creates full Agreement from NewAgreement form data
   * If Supabase is configured, calls the API
   */
  const addAgreement = useCallback(
    async (newAgreement: NewAgreement, userName: string): Promise<Agreement> => {
      if (!supabaseConfigured || !organization?.id || !profile?.id) {
        // Mock mode: Generate next ID
        const nextId = agreements.length > 0 ? Math.max(...agreements.map((a) => Number(a.id))) + 1 : 1;
        const today = new Date().toISOString().split('T')[0];

        const initialVersion: AgreementVersion = {
          version: 1,
          date: today,
          author: userName,
          changes: 'Initial version created',
        };

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

        const updatedAgreements = [...agreements, agreement];
        setAgreements(updatedAgreements);
        return agreement;
      }

      try {
        setIsLoading(true);

        // Parse data retention to extract years
        const dataRetentionMatch = newAgreement.dataRetention.match(/\d+/);
        const dataRetentionYears = dataRetentionMatch ? parseInt(dataRetentionMatch[0], 10) : 6;

        // Call API to create agreement
        const createdRow = await createAgreementAPI({
          org_id: organization.id,
          name: newAgreement.name,
          type: newAgreement.type,
          counterparty: newAgreement.counterparty,
          effective_date: newAgreement.effectiveDate,
          expiration_date: newAgreement.expirationDate,
          email_alerts: newAgreement.emailAlerts,
          created_by: profile.id,
          compliance_terms: {
            breach_notification_hours: newAgreement.breachNotification,
            audit_rights: newAgreement.auditRights,
            subcontractor_approval: newAgreement.subcontractorApproval === 'required',
            data_retention_years: dataRetentionYears,
            termination_notice_days: newAgreement.terminationNotice,
          },
        });

        // Create Agreement object from created row
        const today = new Date().toISOString().split('T')[0];
        const agreement: Agreement = {
          id: createdRow.id,
          name: createdRow.name,
          type: createdRow.type,
          counterparty: createdRow.counterparty,
          effectiveDate: createdRow.effective_date,
          expirationDate: createdRow.expiration_date,
          status: 'draft',
          signatureStatus: 'unsigned',
          breachNotification: newAgreement.breachNotification,
          complianceTerms: {
            breachNotificationHours: newAgreement.breachNotification,
            auditRights: newAgreement.auditRights,
            subcontractorApproval: newAgreement.subcontractorApproval,
            dataRetention: newAgreement.dataRetention,
            terminationNotice: newAgreement.terminationNotice,
          },
          uploadDate: today,
          versions: [
            {
              version: 1,
              date: today,
              author: userName,
              changes: 'Initial agreement created',
            },
          ],
          currentVersion: 1,
          emailAlerts: newAgreement.emailAlerts,
          extractedData: null,
        };

        // Add to local state
        const updatedAgreements = [...agreements, agreement];
        setAgreements(updatedAgreements);

        return agreement;
      } catch (error) {
        console.error('Error creating agreement:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [supabaseConfigured, organization?.id, profile?.id, agreements]
  );

  /**
   * Remove an agreement by ID
   * If Supabase is configured, soft-deletes via API
   */
  const removeAgreement = useCallback(
    async (id: string | number) => {
      if (!supabaseConfigured) {
        // Mock mode: just filter from local state
        setAgreements((prevAgreements) =>
          prevAgreements.filter((agreement) => agreement.id !== id)
        );
        return;
      }

      try {
        setIsLoading(true);
        // Call API to soft-delete
        await deleteAgreementAPI(String(id));
        // Remove from local state
        setAgreements((prevAgreements) =>
          prevAgreements.filter((agreement) => agreement.id !== id)
        );
      } catch (error) {
        console.error('Error removing agreement:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [supabaseConfigured]
  );

  /**
   * Update an agreement by ID
   * If Supabase is configured, persists changes via API
   */
  const updateAgreement = useCallback(
    async (id: string | number, updates: Partial<Agreement>) => {
      if (!supabaseConfigured || !profile?.id) {
        // Mock mode: update local state only
        setAgreements((prevAgreements) =>
          prevAgreements.map((agreement) =>
            agreement.id === id ? { ...agreement, ...updates } : agreement
          )
        );
        return;
      }

      try {
        setIsLoading(true);

        // Convert camelCase updates to snake_case for API
        const apiUpdates: any = {};

        if (updates.name) apiUpdates.name = updates.name;
        if (updates.type) apiUpdates.type = updates.type;
        if (updates.counterparty) apiUpdates.counterparty = updates.counterparty;
        if (updates.effectiveDate) apiUpdates.effective_date = updates.effectiveDate;
        if (updates.expirationDate) apiUpdates.expiration_date = updates.expirationDate;
        if (updates.status) apiUpdates.status = updates.status;
        if (updates.signatureStatus) apiUpdates.signature_status = updates.signatureStatus;
        if (updates.emailAlerts !== undefined) apiUpdates.email_alerts = updates.emailAlerts;

        // Handle compliance terms
        if (updates.complianceTerms) {
          apiUpdates.compliance_terms = {
            breach_notification_hours: updates.complianceTerms.breachNotificationHours,
            audit_rights: updates.complianceTerms.auditRights,
            subcontractor_approval: updates.complianceTerms.subcontractorApproval === 'required',
            data_retention_years:
              updates.complianceTerms.dataRetention.match(/\d+/)?.[0] ?? 6,
            termination_notice_days: updates.complianceTerms.terminationNotice,
          };
        }

        // Call API to update
        await updateAgreementAPI(
          String(id),
          apiUpdates,
          profile.id,
          profile.full_name,
          'Agreement updated'
        );

        // Update local state
        setAgreements((prevAgreements) =>
          prevAgreements.map((agreement) =>
            agreement.id === id ? { ...agreement, ...updates } : agreement
          )
        );
      } catch (error) {
        console.error('Error updating agreement:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [supabaseConfigured, profile?.id]
  );

  const value: AgreementContextType = {
    agreements,
    setAgreements,
    addAgreement,
    removeAgreement,
    updateAgreement,
    refreshAgreements,
    isLoading,
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
