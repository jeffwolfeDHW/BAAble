/**
 * AuthContext - Complete Supabase-based authentication and session management
 * Provides user authentication, profile data, and organization context
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Profile, Organization } from '@/lib/database.types';
import { defaultUser } from '@/data/mock-data';

/**
 * Authentication state interface
 */
interface AuthState {
  user: SupabaseUser | null;
  profile: Profile | null;
  organization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Authentication context type definition
 */
interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    metadata?: {
      full_name: string;
      company: string;
    }
  ) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  // Mock data fallback for demo mode
  useMockAuth: boolean;
  // Convenience getter for current user data
  currentUser: {
    id: string;
    name: string;
    email: string;
    company: string;
    role: string;
  };
}

/**
 * Create the auth context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Mock user for demo mode when Supabase isn't configured
 */
const createMockProfile = (): Profile => ({
  id: 'mock-user-123',
  full_name: defaultUser.name,
  email: defaultUser.email,
  role: defaultUser.role,
  company: defaultUser.company,
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

/**
 * Mock organization for demo mode
 */
const createMockOrganization = (): Organization => ({
  id: 'mock-org-123',
  name: defaultUser.company,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

/**
 * AuthProvider component
 * Wraps the application and provides authentication state with Supabase integration
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    organization: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const supabaseConfigured = isSupabaseConfigured();
  const useMockAuth = !supabaseConfigured;

  /**
   * Fetch user profile from database
   */
  const fetchUserProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      if (!supabaseConfigured) return null;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    [supabaseConfigured]
  );

  /**
   * Fetch user's primary organization
   */
  const fetchUserOrganization = useCallback(
    async (userId: string): Promise<Organization | null> => {
      if (!supabaseConfigured) return null;

      try {
        const { data, error } = await supabase
          .from('org_members')
          .select('org_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (error || !data) {
          console.error('Error fetching org member:', error);
          return null;
        }

        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', (data as any).org_id)
          .single();

        if (orgError) {
          console.error('Error fetching organization:', orgError);
          return null;
        }

        return org as any;
      } catch (error) {
        console.error('Error fetching user organization:', error);
        return null;
      }
    },
    [supabaseConfigured]
  );

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      if (useMockAuth) {
        // Demo mode: use mock data
        setAuthState({
          user: null,
          profile: createMockProfile(),
          organization: createMockOrganization(),
          isLoading: false,
          isAuthenticated: true,
        });
        return;
      }

      try {
        // Try to restore session from Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setAuthState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        if (data.session && data.session.user) {
          const profile = await fetchUserProfile(data.session.user.id);
          const organization = await fetchUserOrganization(data.session.user.id);

          setAuthState({
            user: data.session.user,
            profile,
            organization,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            organization: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          user: null,
          profile: null,
          organization: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, [useMockAuth, fetchUserProfile, fetchUserOrganization]);

  /**
   * Subscribe to auth state changes
   */
  useEffect(() => {
    if (useMockAuth) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session && session.user) {
        const profile = await fetchUserProfile(session.user.id);
        const organization = await fetchUserOrganization(session.user.id);

        setAuthState({
          user: session.user,
          profile,
          organization,
          isLoading: false,
          isAuthenticated: true,
        });
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          profile: null,
          organization: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [useMockAuth, fetchUserProfile, fetchUserOrganization]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      if (useMockAuth) {
        // Demo mode: just check if email matches
        if (email === 'demo@example.com' && password === 'password') {
          setAuthState({
            user: null,
            profile: createMockProfile(),
            organization: createMockOrganization(),
            isLoading: false,
            isAuthenticated: true,
          });
          return;
        } else {
          throw new Error('Demo credentials: demo@example.com / password');
        }
      }

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Sign in failed';
        throw new Error(message);
      }
    },
    [useMockAuth]
  );

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata?: {
        full_name: string;
        company: string;
      }
    ) => {
      if (useMockAuth) {
        // Demo mode: mock signup
        setAuthState({
          user: null,
          profile: {
            id: `mock-user-${Date.now()}`,
            full_name: metadata?.full_name || 'Demo User',
            email,
            role: 'admin',
            company: metadata?.company || '',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          organization: {
            id: `mock-org-${Date.now()}`,
            name: metadata?.company || 'Demo Company',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          isLoading: false,
          isAuthenticated: true,
        });
        return;
      }

      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: metadata?.full_name,
              company: metadata?.company,
            },
          },
        });

        if (error) throw error;

        // After signup, create profile and organization
        // These would typically be handled by a database trigger
        // But we can set them up here for demo purposes
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Sign up failed';
        throw new Error(message);
      }
    },
    [useMockAuth]
  );

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    if (useMockAuth) {
      setAuthState({
        user: null,
        profile: null,
        organization: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      throw new Error(message);
    }
  }, [useMockAuth]);

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = useCallback(async () => {
    if (useMockAuth) {
      // Demo mode: mock Google login
      setAuthState({
        user: null,
        profile: createMockProfile(),
        organization: createMockOrganization(),
        isLoading: false,
        isAuthenticated: true,
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign in failed';
      throw new Error(message);
    }
  }, [useMockAuth]);

  /**
   * Request password reset email
   */
  const resetPassword = useCallback(
    async (email: string) => {
      if (useMockAuth) {
        // Demo mode: just pretend to send email
        console.log('Demo mode: would send reset email to', email);
        return;
      }

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Password reset failed';
        throw new Error(message);
      }
    },
    [useMockAuth]
  );

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!authState.user) {
        throw new Error('No authenticated user');
      }

      if (useMockAuth) {
        // Demo mode: update mock profile
        setAuthState((prev) => ({
          ...prev,
          profile: prev.profile
            ? {
                ...prev.profile,
                ...updates,
                updated_at: new Date().toISOString(),
              }
            : null,
        }));
        return;
      }

      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', authState.user.id);

        if (error) throw error;

        // Refresh profile
        const profile = await fetchUserProfile(authState.user.id);
        setAuthState((prev) => ({
          ...prev,
          profile,
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Profile update failed';
        throw new Error(message);
      }
    },
    [authState.user, useMockAuth, fetchUserProfile]
  );

  const currentUser = {
    id: authState.profile?.id || 'unknown',
    name: authState.profile?.full_name || 'Guest User',
    email: authState.profile?.email || 'guest@example.com',
    company: authState.profile?.company || 'Unknown Company',
    role: authState.profile?.role || 'internal',
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updateProfile,
    useMockAuth,
    currentUser,
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
