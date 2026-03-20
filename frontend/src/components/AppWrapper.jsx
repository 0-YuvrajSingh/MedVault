import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { getThemeClasses } from '../styles/themes';
import { ToastProvider } from './ui/Toast';
import { ErrorBoundary } from './ui';

/**
 * Main App Wrapper with Theme & Toast Providers
 */
const AppWrapper = ({ children }) => {
  const { currentTheme } = useTheme();

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-surface dark:bg-surface-dark">
          {children}
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default AppWrapper;
