import React, { createContext, useContext, useState, useEffect } from 'react';
import { getThemeForRole } from '@/styles/themes';
import type { Role } from '@/types';

interface ThemeContextValue {
  currentTheme: string;
  isDarkMode: boolean;
  updateTheme: (role: Role) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') ?? '{}');
      if (user.role) setCurrentTheme(getThemeForRole(user.role));
    } catch { /* ignore */ }

    const dark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(dark);
    if (dark) document.documentElement.classList.add('dark');
  }, []);

  const updateTheme = (role: Role) => setCurrentTheme(getThemeForRole(role));

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('darkMode', String(next));
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, isDarkMode, updateTheme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
