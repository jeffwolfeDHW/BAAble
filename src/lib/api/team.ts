import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { TeamMemberRow, UserRole, MemberStatus } from '@/lib/database.types';

export interface CreateTeamMemberInput {
  org_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  invited_by: string;
}

export interface UpdateTeamMemberInput {
  full_name?: string;
  email?: string;
  role?: UserRole;
  status?: MemberStatus;
}

// ──────────────────────────────────────────────
// Fetch all team members for an organization
// ──────────────────────────────────────────────
export async function fetchTeamMembers(orgId: string): Promise<TeamMemberRow[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ──────────────────────────────────────────────
// Add a new team member
// ──────────────────────────────────────────────
export async function createTeamMember(
  input: CreateTeamMemberInput
): Promise<TeamMemberRow> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      org_id: input.org_id,
      full_name: input.full_name,
      email: input.email,
      role: input.role,
      status: 'active',
      invited_by: input.invited_by,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

// ──────────────────────────────────────────────
// Update a team member
// ──────────────────────────────────────────────
export async function updateTeamMember(
  id: string,
  input: UpdateTeamMemberInput
): Promise<TeamMemberRow> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('team_members')
    .update(input as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

// ──────────────────────────────────────────────
// Remove a team member (hard delete)
// ──────────────────────────────────────────────
export async function removeTeamMember(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

  const { error } = await supabase.from('team_members').delete().eq('id', id);
  if (error) throw error;
}
