'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (orgId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

          // Optionally fetch fresh user data from API
          try {
            const freshUser = await authApi.getCurrentUser();
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          } catch (error) {
            // If token is invalid, clear auth data
            console.error('Failed to fetch user:', error);
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

  const login= async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      setToken(response.token);
      setUser(response.user as any);
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
    // Force reload to ensure all queries strictly respect the new context
    window.location.reload(); 
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
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
