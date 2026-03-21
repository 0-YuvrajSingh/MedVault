// @ts-nocheck
/**
 * Error Logging Service
 * Captures and logs errors with context for debugging and monitoring
 */

import config from './config';

class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 50; // Keep last 50 errors in memory
    this.isProduction = config.isProd;
    this.enableErrorTracking = config.enableErrorTracking;
  }

  /**
   * Log an error with context
   * @param {Error} error - The error object
   * @param {Object} context - Additional context about the error
   */
  logError(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      type: error.name || 'Error',
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    };

    // Store in memory
    this.errors.push(errorEntry);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift(); // Remove oldest error
    }

    // Log to console in development
    if (!this.isProduction) {
      console.group(`🔴 Error: ${errorEntry.message}`);
      console.error('Error:', error);
      console.info('Context:', errorEntry.context);
      console.info('Timestamp:', errorEntry.timestamp);
      console.groupEnd();
    }

    // In production, you could send to a backend logging service
    if (this.isProduction) {
      this.sendToBackend(errorEntry);
    }

    // Store in localStorage for persistence (optional)
    this.persistError(errorEntry);
  }

  /**
   * Log a boundary error (from ErrorBoundary)
   */
  logBoundaryError(error, errorInfo, componentStack) {
    this.logError(error, {
      type: 'React Error Boundary',
      componentStack: errorInfo?.componentStack || componentStack,
      errorInfo
    });
  }

  /**
   * Log an API error
   */
  logApiError(error, endpoint, method = 'GET') {
    this.logError(error, {
      type: 'API Error',
      endpoint,
      method,
      status: error.response?.status,
      data: error.response?.data
    });
  }

  /**
   * Log a user action error
   */
  logUserActionError(error, action, userId = null) {
    this.logError(error, {
      type: 'User Action Error',
      action,
      userId
    });
  }

  /**
   * Send error to backend (production only, when error tracking enabled)
   */
  async sendToBackend(errorEntry) {
    // Only send to backend if error tracking is enabled
    if (!this.enableErrorTracking) {
      return;
    }

    try {
      // Import axios dynamically to avoid circular dependency
      const axios = (await import('axios')).default;
      
      await axios.post(`${config.apiBaseUrl}/logs/errors`, {
        timestamp: errorEntry.timestamp,
        message: errorEntry.message,
        stack: errorEntry.stack,
        type: errorEntry.type,
        url: errorEntry.context.url,
        userAgent: errorEntry.context.userAgent,
        context: JSON.stringify(errorEntry.context),
        environment: config.env,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        timeout: 5000, // 5 second timeout
      });
      
      console.info('✅ Error logged to backend');
    } catch (err) {
      // Silent fail - don't want logging to break the app
      // Only log in development
      if (!this.isProduction) {
        console.warn('⚠️ Failed to send error to backend:', err.message);
      }
    }
  }

  /**
   * Persist error to localStorage
   */
  persistError(errorEntry) {
    try {
      const stored = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      stored.push(errorEntry);
      // Keep only last 20 in localStorage
      if (stored.length > 20) {
        stored.shift();
      }
      localStorage.setItem('errorLogs', JSON.stringify(stored));
    } catch (err) {
      // Silent fail
    }
  }

  /**
   * Get all errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Get errors from localStorage
   */
  getPersistedErrors() {
    try {
      return JSON.parse(localStorage.getItem('errorLogs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = [];
    localStorage.removeItem('errorLogs');
  }

  /**
   * Initialize global error handlers
   */
  initGlobalHandlers() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        type: 'Unhandled Error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          type: 'Unhandled Promise Rejection',
          promise: event.promise
        }
      );
    });

    console.info('✅ Global error handlers initialized');
  }
}

// Create singleton instance
const errorLogger = new ErrorLogger();

// Initialize global handlers (only when error tracking enabled)
if (typeof window !== 'undefined' && config.enableErrorTracking) {
  errorLogger.initGlobalHandlers();
}

export default errorLogger;
