import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type {
  AgreementRow,
  AgreementWithTerms,
  AgreementType,
  AgreementStatus,
  SignatureStatus,
} from '@/lib/database.types';

export interface AgreementFilters {
  search?: string;
  type?: AgreementType | 'all';
  status?: AgreementStatus | 'all';
  signatureStatus?: SignatureStatus | 'all';
  expiringWithinDays?: number;
}

export interface CreateAgreementInput {
  org_id: string;
  name: string;
  type: AgreementType;
  counterparty: string;
  effective_date: string;
  expiration_date: string;
  email_alerts: boolean;
  created_by: string;
  compliance_terms: {
    breach_notification_hours: number;
    audit_rights: boolean;
    subcontractor_approval: boolean;
    data_retention_years: number;
    termination_notice_days: number;
  };
}

export interface UpdateAgreementInput {
  name?: string;
  type?: AgreementType;
  status?: AgreementStatus;
  counterparty?: string;
  effective_date?: string;
  expiration_date?: string;
  signature_status?: SignatureStatus;
  email_alerts?: boolean;
  compliance_terms?: {
    breach_notification_hours?: number;
    audit_rights?: boolean;
    subcontractor_approval?: boolean;
    data_retention_years?: number;
    termination_notice_days?: number;
  };
}

// ──────────────────────────────────────────────
// Fetch all agreements for an organization
// ──────────────────────────────────────────────
export async function fetchAgreements(
  orgId: string,
  filters?: AgreementFilters
): Promise<AgreementWithTerms[]> {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('agreements')
    .select(`
      *,
      compliance_terms:agreement_compliance_terms(*),
      versions:agreement_versions(*),
      documents:agreement_documents(*),
      extraction:extraction_results(*)
    `)
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type);
  }
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.signatureStatus && filters.signatureStatus !== 'all') {
    query = query.eq('signature_status', filters.signatureStatus);
  }
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,counterparty.ilike.%${filters.search}%`
    );
  }
  if (filters?.expiringWithinDays) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + filters.expiringWithinDays);
    query = query.lte('expiration_date', futureDate.toISOString().split('T')[0]);
    query = query.gte('expiration_date', new Date().toISOString().split('T')[0]);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((row: any) => ({
    ...row,
    compliance_terms: Array.isArray(row.compliance_terms)
      ? row.compliance_terms[0] || null
      : row.compliance_terms,
    extraction: Array.isArray(row.extraction)
      ? row.extraction[0] || null
      : row.extraction,
  }));
}

// ──────────────────────────────────────────────
// Fetch a single agreement by ID
// ──────────────────────────────────────────────
export async function fetchAgreement(id: string): Promise<AgreementWithTerms | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('agreements')
    .select(`
      *,
      compliance_terms:agreement_compliance_terms(*),
      versions:agreement_versions(*),
      documents:agreement_documents(*),
      extraction:extraction_results(*)
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    ...(data as any),
    compliance_terms: Array.isArray((data as any).compliance_terms)
      ? (data as any).compliance_terms[0] || null
      : (data as any).compliance_terms,
    extraction: Array.isArray((data as any).extraction)
      ? (data as any).extraction[0] || null
      : (data as any).extraction,
  } as AgreementWithTerms;
}

// ──────────────────────────────────────────────
// Create a new agreement with compliance terms
// ──────────────────────────────────────────────
export async function createAgreement(
  input: CreateAgreementInput
): Promise<AgreementRow> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  // Insert agreement
  const { data: agreement, error: agreementError } = await supabase
    .from('agreements')
    .insert({
      org_id: input.org_id,
      name: input.name,
      type: input.type,
      counterparty: input.counterparty,
      effective_date: input.effective_date,
      expiration_date: input.expiration_date,
      email_alerts: input.email_alerts,
      created_by: input.created_by,
      status: 'draft',
      signature_status: 'unsigned',
      current_version: 1,
    } as any)
    .select()
    .single();

  if (agreementError) throw agreementError;

  // Insert compliance terms
  const { error: termsError } = await supabase
    .from('agreement_compliance_terms')
    .insert({
      agreement_id: (agreement as any).id,
      ...input.compliance_terms,
    } as any);

  if (termsError) throw termsError;

  // Create initial version
  const { error: versionError } = await supabase
    .from('agreement_versions')
    .insert({
      agreement_id: (agreement as any).id,
      version_number: 1,
      changes: 'Initial agreement created',
      author_id: input.created_by,
      author_name: '', // Will be populated by the caller
    } as any);

  if (versionError) throw versionError;

  return agreement as any;
}

// ──────────────────────────────────────────────
// Update an existing agreement
// ──────────────────────────────────────────────
export async function updateAgreement(
  id: string,
  input: UpdateAgreementInput,
  userId: string,
  userName: string,
  changeDescription: string
): Promise<AgreementRow> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const { compliance_terms, ...agreementFields } = input;

  // Update agreement fields
  if (Object.keys(agreementFields).length > 0) {
    const { error } = await supabase
      .from('agreements')
      .update(agreementFields as any)
      .eq('id', id);
    if (error) throw error;
  }

  // Update compliance terms if provided
  if (compliance_terms) {
    const { error } = await supabase
      .from('agreement_compliance_terms')
      .update(compliance_terms as any)
      .eq('agreement_id', id);
    if (error) throw error;
  }

  // Bump version
  const { data: current } = await supabase
    .from('agreements')
    .select('current_version')
    .eq('id', id)
    .single();

  const newVersion = ((current as any)?.current_version || 1) + 1;

  await supabase.from('agreements').update({ current_version: newVersion } as any).eq('id', id);

  await supabase.from('agreement_versions').insert({
    agreement_id: id,
    version_number: newVersion,
    changes: changeDescription,
    author_id: userId,
    author_name: userName,
  } as any);

  // Fetch and return updated agreement
  const { data, error } = await supabase
    .from('agreements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as any;
}

// ──────────────────────────────────────────────
// Soft-delete an agreement
// ──────────────────────────────────────────────
export async function deleteAgreement(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('agreements')
    .update({ deleted_at: new Date().toISOString() } as any)
    .eq('id', id);

  if (error) throw error;
}

// ──────────────────────────────────────────────
// Get agreement count stats
// ──────────────────────────────────────────────
export async function fetchAgreementStats(orgId: string) {
  if (!isSupabaseConfigured()) return { total: 0, active: 0, draft: 0, expired: 0 };

  const { data, error } = await supabase
    .from('agreements')
    .select('status')
    .eq('org_id', orgId)
    .is('deleted_at', null);

  if (error) throw error;

  const stats = { total: 0, active: 0, draft: 0, expired: 0 };
  (data || []).forEach((a) => {
    stats.total++;
    if (a.status === 'active') stats.active++;
    else if (a.status === 'draft') stats.draft++;
    else if (a.status === 'expired') stats.expired++;
  });

  return stats;
}
