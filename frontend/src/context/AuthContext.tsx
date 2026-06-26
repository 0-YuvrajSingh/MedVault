import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { setApiToken } from '../api/axios';
import type { DecodedToken } from '../types';

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: string | null;
  fullName: string | null;
  login: (token: string, fullName?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setRole(decoded.role);
        setUserId(decoded.userId || decoded.sub);
        setApiToken(token);
      } catch {
        logout();
      }
    }
  }, [token]);

  const login = useCallback((newToken: string, name?: string) => {
    setToken(newToken);
    setApiToken(newToken);
    if (name) setFullName(name);
    try {
      const decoded: DecodedToken = jwtDecode(newToken);
      setRole(decoded.role);
      setUserId(decoded.userId || decoded.sub);
    } catch {
      // Will be handled by useEffect
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRole(null);
    setUserId(null);
    setFullName(null);
    setApiToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, userId, fullName, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
