/**
 * TeamContext - Team member management state and operations
 * Provides team member data and CRUD operations
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { TeamMember } from '@/types/index';
import { initialTeamMembers } from '@/data/mock-data';

/**
 * Team context type definition
 */
interface TeamContextType {
  teamMembers: TeamMember[];
  setTeamMembers: (teamMembers: TeamMember[]) => void;
  addTeamMember: (teamMember: Omit<TeamMember, 'id'>) => TeamMember;
  removeTeamMember: (id: number) => void;
}

/**
 * Create the team context
 */
const TeamContext = createContext<TeamContextType | undefined>(undefined);

/**
 * TeamProvider component
 * Wraps the application and provides team member state and operations
 */
export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);

  /**
   * Add a new team member
   */
  const addTeamMember = useCallback(
    (teamMemberData: Omit<TeamMember, 'id'>): TeamMember => {
      // Generate next ID
      const nextId = teamMembers.length > 0 ? Math.max(...teamMembers.map((m) => m.id)) + 1 : 1;

      const newTeamMember: TeamMember = {
        ...teamMemberData,
        id: nextId,
      };

      setTeamMembers((prevMembers) => [...prevMembers, newTeamMember]);

      return newTeamMember;
    },
    [teamMembers]
  );

  /**
   * Remove a team member by ID
   */
  const removeTeamMember = useCallback((id: number) => {
    setTeamMembers((prevMembers) => prevMembers.filter((member) => member.id !== id));
  }, []);

  const value: TeamContextType = {
    teamMembers,
    setTeamMembers,
    addTeamMember,
    removeTeamMember,
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
