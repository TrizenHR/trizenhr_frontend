'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { User } from '@/lib/types';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  setSession: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (orgId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Refresh profile; returns null if session invalid, undefined if backend unreachable. */
async function refreshCurrentUser(): Promise<User | null | undefined> {
  try {
    return await authApi.getCurrentUser();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return null;
      }
      // Network Error / backend restarting — keep cached session
      if (!error.response) {
        console.warn(
          '[auth] Profile refresh skipped (API unreachable). Using cached session.'
        );
        return undefined;
      }
    }
    console.warn('[auth] Profile refresh failed:', error);
    return undefined;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrganizationId, setSelectedState] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedOrgId = localStorage.getItem('selectedOrganizationId');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          if (storedOrgId) setSelectedState(storedOrgId);

          const freshUser = await refreshCurrentUser();
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          } else if (freshUser === null) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('selectedOrganizationId');
            setToken(null);
            setUser(null);
            setSelectedState(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const setSession = (sessionToken: string, sessionUser: User) => {
    localStorage.setItem('token', sessionToken);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    setToken(sessionToken);
    setUser(sessionUser);
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await authApi.login(email, password);

      setSession(response.token, response.user as User);

      // Refresh profile in background (includes organization name when API is up)
      void refreshCurrentUser().then((freshUser) => {
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      });

      return response.user as User;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated'); // Clear old demo auth
    localStorage.removeItem('selectedOrganizationId');

    setToken(null);
    setUser(null);
    setSelectedState(null);

    // Optional: Call logout API endpoint
    authApi.logout().catch(console.error);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const setSelectedOrganizationId = (orgId: string | null) => {
    setSelectedState(orgId);
    if (orgId) {
      localStorage.setItem('selectedOrganizationId', orgId);
    } else {
      localStorage.removeItem('selectedOrganizationId');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    setSession,
    logout,
    updateUser,
    selectedOrganizationId,
    setSelectedOrganizationId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
