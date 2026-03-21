import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { queryClient } from './config/queryClient';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
import { logConfig, validateConfig } from './utils/config';
import logger from './utils/logger';

if (!validateConfig()) {
  logger.error('Configuration validation failed. Check environment variables.');
}
logConfig();

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
