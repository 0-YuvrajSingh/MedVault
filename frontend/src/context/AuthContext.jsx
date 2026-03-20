import { createContext, useContext, useState, useEffect } from "react";
import { logout as apiLogout, injectAxiosToken } from "../api";
import { logger } from "../utils/logger";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage if available
  const [user, setUserState] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setTokenState] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    injectAxiosToken(token);
  }, [token]);

  const login = (tokenValue, userData) => {
    logger.log('Login called with:', { token: tokenValue?.substring(0, 20) + '...', userData });
    setTokenState(tokenValue);
    setUserState(userData);
    // Persist to localStorage
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
    logger.log('Token and user set successfully');
  };

  const logout = () => {
    setTokenState(null);
    setUserState(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    hasRole,
    loading,
    setUser: setUserState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
