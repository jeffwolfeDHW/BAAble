/**
 * AuthContext - User authentication and session management
 * Provides current user information and authentication state
 */

import React, { createContext, useContext, useState } from 'react';
import { User } from '@/types/index';
import { defaultUser } from '@/data/mock-data';

/**
 * Auth context type definition
 */
interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

/**
 * Create the auth context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component
 * Wraps the application and provides authentication state
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);

  const value: AuthContextType = {
    currentUser,
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * Throws error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
