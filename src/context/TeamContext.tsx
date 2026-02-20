/**
 * TeamContext - Team member management with Supabase backend and mock fallback
 * Provides team member data and CRUD operations
 * Bridges camelCase frontend interface with snake_case database rows
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TeamMember } from '@/types/index';
import { initialTeamMembers } from '@/data/mock-data';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  fetchTeamMembers,
  createTeamMember as createTeamMemberAPI,
  updateTeamMember as updateTeamMemberAPI,
  removeTeamMember as removeTeamMemberAPI,
} from '@/lib/api/team';
import type { TeamMemberRow } from '@/lib/database.types';
import { useAuth } from '@/context/AuthContext';

/**
 * Team context type definition
 */
interface TeamContextType {
  teamMembers: TeamMember[];
  setTeamMembers: (teamMembers: TeamMember[]) => void;
  addTeamMember: (teamMember: Omit<TeamMember, 'id'>) => Promise<TeamMember>;
  removeTeamMember: (id: string | number) => Promise<void>;
  updateTeamMember: (id: string | number, updates: Partial<TeamMember>) => Promise<void>;
  refreshTeamMembers: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Create the team context
 */
const TeamContext = createContext<TeamContextType | undefined>(undefined);

/**
 * Map database row (snake_case) to frontend TeamMember (camelCase)
 */
function mapRowToTeamMember(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status === 'invited' ? 'inactive' : row.status === 'active' ? 'active' : 'inactive',
  };
}

/**
 * TeamProvider component
 * Wraps the application and provides team member state and operations
 * Handles both Supabase backend and mock data fallback
 */
export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { organization, profile } = useAuth();
  const supabaseConfigured = isSupabaseConfigured();

  /**
   * Fetch team members from Supabase if configured, otherwise use mock data
   */
  const refreshTeamMembers = useCallback(async () => {
    if (!supabaseConfigured || !organization?.id) {
      // Use mock data
      setTeamMembers(initialTeamMembers);
      return;
    }

    try {
      setIsLoading(true);
      const rows = await fetchTeamMembers(organization.id);
      const mappedMembers = rows.map(mapRowToTeamMember);
      setTeamMembers(mappedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Fall back to mock data on error
      setTeamMembers(initialTeamMembers);
    } finally {
      setIsLoading(false);
    }
  }, [supabaseConfigured, organization?.id]);

  /**
   * Initialize team members on mount
   */
  useEffect(() => {
    if (supabaseConfigured && organization?.id) {
      refreshTeamMembers();
    }
  }, [supabaseConfigured, organization?.id, refreshTeamMembers]);

  /**
   * Add a new team member
   * If Supabase is configured, calls the API
   */
  const addTeamMember = useCallback(
    async (teamMemberData: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
      if (!supabaseConfigured || !organization?.id || !profile?.id) {
        // Mock mode: Generate next ID
        const nextId = teamMembers.length > 0 ? Math.max(...teamMembers.map((m) => Number(m.id))) + 1 : 1;

        const newTeamMember: TeamMember = {
          ...teamMemberData,
          id: nextId,
        };

        setTeamMembers((prevMembers) => [...prevMembers, newTeamMember]);
        return newTeamMember;
      }

      try {
        setIsLoading(true);

        // Call API to create team member
        const createdRow = await createTeamMemberAPI({
          org_id: organization.id,
          full_name: teamMemberData.name,
          email: teamMemberData.email,
          role: teamMemberData.role,
          invited_by: profile.id,
        });

        // Map created row to TeamMember
        const newTeamMember = mapRowToTeamMember(createdRow);

        // Add to local state
        setTeamMembers((prevMembers) => [...prevMembers, newTeamMember]);

        return newTeamMember;
      } catch (error) {
        console.error('Error creating team member:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [supabaseConfigured, organization?.id, profile?.id, teamMembers]
  );

  /**
   * Remove a team member by ID
   * If Supabase is configured, deletes via API
   */
  const removeTeamMember = useCallback(
    async (id: string | number) => {
      if (!supabaseConfigured) {
        // Mock mode: just filter from local state
        setTeamMembers((prevMembers) => prevMembers.filter((member) => member.id !== id));
        return;
      }

      try {
        setIsLoading(true);
        // Call API to delete
        await removeTeamMemberAPI(String(id));
        // Remove from local state
        setTeamMembers((prevMembers) => prevMembers.filter((member) => member.id !== id));
      } catch (error) {
        console.error('Error removing team member:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [supabaseConfigured]
  );

  /**
   * Update a team member by ID
   * If Supabase is configured, persists changes via API
   */
  const updateTeamMember = useCallback(
    async (id: string | number, updates: Partial<TeamMember>) => {
      if (!supabaseConfigured) {
        // Mock mode: update local state only
        setTeamMembers((prevMembers) =>
          prevMembers.map((member) => {
            if (member.id === id) {
              // Convert camelCase updates to camelCase in local state
              return {
                ...member,
                name: updates.name ?? member.name,
                email: updates.email ?? member.email,
                role: updates.role ?? member.role,
                status: updates.status ?? member.status,
              };
            }
            return member;
          })
        );
        return;
      }

      try {
        setIsLoading(true);

        // Convert camelCase updates to snake_case for API
        const apiUpdates: any = {};

        if (updates.name) apiUpdates.full_name = updates.name;
        if (updates.email) apiUpdates.email = updates.email;
        if (updates.role) apiUpdates.role = updates.role;
        if (updates.status) {
          // Map 'active'/'inactive' to database status
          apiUpdates.status = updates.status === 'active' ? 'active' : 'inactive';
        }

        // Call API to update
        const updatedRow = await updateTeamMemberAPI(String(id), apiUpdates);

        // Update local state with mapped result
        const updatedMember = mapRowToTeamMember(updatedRow);
        setTeamMembers((prevMembers) =>
          prevMembers.map((member) => (member.id === id ? updatedMember : member))
        );
      } catch (error) {
        console.error('Error updating team member:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [supabaseConfigured]
  );

  const value: TeamContextType = {
    teamMembers,
    setTeamMembers,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    refreshTeamMembers,
    isLoading,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

/**
 * Hook to use team context
 * Throws error if used outside TeamProvider
 */
export const useTeam = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};
