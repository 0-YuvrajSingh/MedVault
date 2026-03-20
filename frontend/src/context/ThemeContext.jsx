import React, { createContext, useContext, useState, useEffect } from 'react';
import { getThemeForRole } from '../styles/themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from user role (stored in auth context/localStorage)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role) {
      const theme = getThemeForRole(user.role);
      setCurrentTheme(theme);
    }
    
    // Check for dark mode preference
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModePreference);
    
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const updateTheme = (role) => {
    const theme = getThemeForRole(role);
    setCurrentTheme(theme);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', newValue);
      
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return newValue;
    });
  };

  const value = {
    currentTheme,
    isDarkMode,
    updateTheme,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
