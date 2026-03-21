import React, { createContext, useContext, useState, useEffect } from 'react';
import { logout as apiLogout, injectAxiosToken } from '@/api';
import { logger } from '@/utils/logger';
import type { User, Role } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: Role) => boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    injectAxiosToken(token);
  }, [token]);

  const login = (tokenValue: string, userData: User) => {
    logger.log('Login called:', { token: tokenValue.substring(0, 20) + '...', userData });
    setToken(tokenValue);
    setUser(userData);
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = (): boolean => !!user && !!token;

  const hasRole = (role: Role): boolean => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated, hasRole, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
