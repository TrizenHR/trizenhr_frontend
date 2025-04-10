
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Role = 'admin' | 'user' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: Role;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<Role>(null);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setUserRole(user.role);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // This would be an API call in a real application
    const { credentials } = await import('../utils/auth');
    
    const user = credentials.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (user) {
      setIsAuthenticated(true);
      setUserRole(user.role);
      
      // Store user info in localStorage
      localStorage.setItem('auth_user', JSON.stringify({
        email: user.email,
        role: user.role
      }));

      return { success: true, message: 'Login successful!' };
    }

    return { success: false, message: 'Invalid email or password' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
