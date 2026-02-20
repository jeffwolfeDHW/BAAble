import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { SignatureRequestRow, SignatureRequestStatus } from '@/lib/database.types';

export interface CreateSignatureRequestInput {
  agreement_id: string;
  requested_by: string;
  signers: Array<{
    name: string;
    email: string;
    order: number;
  }>;
  message?: string;
}

// ──────────────────────────────────────────────
// Fetch signature requests for an agreement
// ──────────────────────────────────────────────
export async function fetchSignatureRequests(
  agreementId: string
): Promise<SignatureRequestRow[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('signature_requests')
    .select('*')
    .eq('agreement_id', agreementId)
    .order('signer_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ──────────────────────────────────────────────
// Create signature requests for an agreement
// ──────────────────────────────────────────────
export async function createSignatureRequests(
  input: CreateSignatureRequestInput
): Promise<SignatureRequestRow[]> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const records = input.signers.map((signer) => ({
    agreement_id: input.agreement_id,
    requested_by: input.requested_by,
    signer_name: signer.name,
    signer_email: signer.email,
    signer_order: signer.order,
    status: 'pending' as SignatureRequestStatus,
  }));

  const { data, error } = await supabase
    .from('signature_requests')
    .insert(records as any)
    .select();

  if (error) throw error;

  // Update agreement signature status to pending
  await supabase
    .from('agreements')
    .update({ signature_status: 'pending' } as any)
    .eq('id', input.agreement_id);

  return data || [];
}

// ──────────────────────────────────────────────
// Update a signature request status
// ──────────────────────────────────────────────
export async function updateSignatureStatus(
  requestId: string,
  status: SignatureRequestStatus
): Promise<SignatureRequestRow> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const updateData: Record<string, any> = { status };
  if (status === 'signed') {
    updateData.signed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('signature_requests')
    .update(updateData as any)
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;

  // Check if all signers have signed
  const { data: allRequests } = await supabase
    .from('signature_requests')
    .select('status')
    .eq('agreement_id', (data as any).agreement_id);

  const allSigned = allRequests?.every((r: any) => r.status === 'signed');
  if (allSigned) {
    await supabase
      .from('agreements')
      .update({ signature_status: 'fully-executed', status: 'active' } as any)
      .eq('id', (data as any).agreement_id);
  }

  return data as any;
}
