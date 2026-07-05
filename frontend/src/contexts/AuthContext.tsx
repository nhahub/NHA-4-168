import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { id: string; email: string; roles: string[] } | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Restore token on app mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // Optionally verify token here
        setIsAuthenticated(true);
        const userData = localStorage.getItem('auth_user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Token restoration failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const getToken = () => localStorage.getItem('auth_token');

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, getToken }}>
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
