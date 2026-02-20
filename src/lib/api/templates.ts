import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ComplianceTemplateRow, Json } from '@/lib/database.types';

export interface ComplianceTermsTemplate {
  breach_notification_hours: number;
  audit_rights: boolean;
  subcontractor_approval: boolean;
  data_retention_years: number;
  termination_notice_days: number;
}

export interface CreateTemplateInput {
  org_id: string;
  name: string;
  description: string;
  terms: ComplianceTermsTemplate;
  created_by: string;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  terms?: ComplianceTermsTemplate;
}

// Default templates available to all organizations
export const DEFAULT_TEMPLATES: Array<{
  name: string;
  description: string;
  terms: ComplianceTermsTemplate;
  color: string;
  icon: string;
}> = [
  {
    name: 'Standard BAA',
    description:
      'HIPAA-compliant Business Associate Agreement with standard compliance terms. Suitable for most healthcare data partnerships.',
    terms: {
      breach_notification_hours: 24,
      audit_rights: true,
      subcontractor_approval: true,
      data_retention_years: 7,
      termination_notice_days: 30,
    },
    color: 'indigo',
    icon: 'FileText',
  },
  {
    name: 'Strict Compliance BAA',
    description:
      'Enhanced compliance terms with shorter breach notification windows and longer retention periods. For high-sensitivity data relationships.',
    terms: {
      breach_notification_hours: 12,
      audit_rights: true,
      subcontractor_approval: true,
      data_retention_years: 10,
      termination_notice_days: 60,
    },
    color: 'green',
    icon: 'Shield',
  },
  {
    name: 'Subcontractor BAA',
    description:
      'Designed for subcontractor relationships with relaxed terms appropriate for limited data access scenarios.',
    terms: {
      breach_notification_hours: 48,
      audit_rights: true,
      subcontractor_approval: false,
      data_retention_years: 3,
      termination_notice_days: 15,
    },
    color: 'purple',
    icon: 'Users',
  },
];

// ──────────────────────────────────────────────
// Fetch all templates for an organization
// ──────────────────────────────────────────────
export async function fetchTemplates(
  orgId: string
): Promise<ComplianceTemplateRow[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('compliance_templates')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ──────────────────────────────────────────────
// Create a custom template
// ──────────────────────────────────────────────
export async function createTemplate(
  input: CreateTemplateInput
): Promise<ComplianceTemplateRow> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('compliance_templates')
    .insert({
      org_id: input.org_id,
      name: input.name,
      description: input.description,
      terms: input.terms as unknown as Json,
      created_by: input.created_by,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

// ──────────────────────────────────────────────
// Update a template
// ──────────────────────────────────────────────
export async function updateTemplate(
  id: string,
  input: UpdateTemplateInput
): Promise<ComplianceTemplateRow> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const updateData: Record<string, any> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.terms !== undefined) updateData.terms = input.terms;

  const { data, error } = await supabase
    .from('compliance_templates')
    .update(updateData as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

// ──────────────────────────────────────────────
// Delete a template
// ──────────────────────────────────────────────
export async function deleteTemplate(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('compliance_templates')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
