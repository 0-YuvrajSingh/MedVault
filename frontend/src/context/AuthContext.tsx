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

  const logout = useCallback(() => {
    setToken(null);
    setRole(null);
    setUserId(null);
    setFullName(null);
    setApiToken(null);
  }, []);

  const login = useCallback((newToken: string, name?: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(newToken);
      // Validate expiry synchronously
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        throw new Error('Token is already expired');
      }
      setRole(decoded.role);
      setUserId(decoded.userId || decoded.sub);
      
      setToken(newToken);
      setApiToken(newToken);
      if (name) setFullName(name);
    } catch (err) {
      console.error('Invalid token during login', err);
      // Synchronous failure: clear state completely
      logout();
      throw err; // Let the caller (e.g., LoginPage) handle it
    }
  }, [logout]);

  // Expiry monitor
  useEffect(() => {
    if (!token) return;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }

      const timeUntilExpiry = (decoded.exp * 1000) - Date.now();
      if (timeUntilExpiry > 0) {
        const timeout = setTimeout(() => logout(), timeUntilExpiry);
        return () => clearTimeout(timeout);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }, [token, logout]);

  // Listen for global 401 events
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

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
