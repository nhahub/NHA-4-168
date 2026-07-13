/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  firstName?: string | null;
  lastName?: string | null;
  studentSsn?: number | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function restoreAuthState(): { isAuthenticated: boolean; user: AuthUser | null } {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return { isAuthenticated: false, user: null };
  }

  try {
    const userData = localStorage.getItem('auth_user');
    return {
      isAuthenticated: true,
      user: userData ? JSON.parse(userData) as AuthUser : null,
    };
  } catch (error) {
    console.error('Token restoration failed:', error);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return { isAuthenticated: false, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(restoreAuthState);

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setAuthState({ isAuthenticated: true, user: userData });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setAuthState({ isAuthenticated: false, user: null });
  };

  const getToken = () => localStorage.getItem('auth_token');

  return (
    <AuthContext.Provider value={{ ...authState, isLoading: false, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
