import { QueryClientProvider } from '@tanstack/react-query';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { queryClient } from './config/queryClient';
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";
import { logConfig, validateConfig } from './utils/config';
import logger from './utils/logger';

// Validate environment configuration
if (!validateConfig()) {
  logger.error('❌ Configuration validation failed. Please check your environment variables.');
}

// Log configuration in development
logConfig();

// Root Error Boundary wraps entire application to catch all unhandled errors
ReactDOM.createRoot(document.getElementById("root")).render(
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
