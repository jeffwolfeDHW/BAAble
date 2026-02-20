import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AuditLogRow, AuditAction, Json } from '@/lib/database.types';

// ──────────────────────────────────────────────
// Log an audit event
// ──────────────────────────────────────────────
export async function logAuditEvent(
  orgId: string,
  userId: string,
  action: AuditAction,
  entityType: string,
  entityId: string,
  details?: Record<string, any>
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  await supabase.from('audit_log').insert({
    org_id: orgId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: (details as Json) || null,
  });
}

// ──────────────────────────────────────────────
// Fetch recent audit log entries
// ──────────────────────────────────────────────
export async function fetchAuditLog(
  orgId: string,
  limit: number = 50
): Promise<AuditLogRow[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
