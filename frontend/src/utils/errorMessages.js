/**
 * Enhanced Error Handling Utilities
 * Provides user-friendly error messages for common error scenarios
 */

/**
 * Error message templates for common scenarios
 */
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    suggestion: 'Check your network connection or try again later.',
  },
  TIMEOUT: {
    title: 'Request Timeout',
    message: 'The request took too long to complete. Please try again.',
    suggestion: 'The server might be busy. Please wait a moment and try again.',
  },
  
  // Authentication errors
  UNAUTHORIZED: {
    title: 'Authentication Required',
    message: 'Please log in to continue.',
    suggestion: 'Your session may have expired. Please log in again.',
  },
  FORBIDDEN: {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource.',
    suggestion: 'Please contact support if you believe this is an error.',
  },
  
  // Validation errors
  VALIDATION_ERROR: {
    title: 'Invalid Input',
    message: 'Please check the form and correct any errors.',
    suggestion: 'Make sure all required fields are filled correctly.',
  },
  
  // Resource errors
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    suggestion: 'The item may have been moved or deleted.',
  },
  CONFLICT: {
    title: 'Conflict',
    message: 'This operation conflicts with existing data.',
    suggestion: 'Please refresh the page and try again.',
  },
  
  // Server errors
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'An unexpected error occurred on the server.',
    suggestion: 'Please try again later or contact support if the problem persists.',
  },
  
  // Generic fallback
  UNKNOWN: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred.',
    suggestion: 'Please try again or contact support if the problem continues.',
  },
};

/**
 * Get user-friendly error message from error response
 * @param {Error|Object} error - Error object or API error response
 * @returns {Object} Formatted error with title, message, and suggestion
 */
export const getErrorMessage = (error) => {
  // Handle network errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return ERROR_MESSAGES.TIMEOUT;
    }
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Handle HTTP status codes
  const status = error.response?.status;
  
  switch (status) {
    case 400:
      return {
        ...ERROR_MESSAGES.VALIDATION_ERROR,
        message: error.response?.data?.message || ERROR_MESSAGES.VALIDATION_ERROR.message,
      };
      
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
      
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
      
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
      
    case 409:
      return {
        ...ERROR_MESSAGES.CONFLICT,
        message: error.response?.data?.message || ERROR_MESSAGES.CONFLICT.message,
      };
      
    case 422:
      return {
        ...ERROR_MESSAGES.VALIDATION_ERROR,
        message: error.response?.data?.message || ERROR_MESSAGES.VALIDATION_ERROR.message,
      };
      
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_MESSAGES.SERVER_ERROR;
      
    default:
      return {
        ...ERROR_MESSAGES.UNKNOWN,
        message: error.response?.data?.message || error.message || ERROR_MESSAGES.UNKNOWN.message,
      };
  }
};

/**
 * Format validation errors for display
 * @param {Object} errors - Validation errors object
 * @returns {Array} Array of formatted error messages
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return [];
  }

  return Object.entries(errors).map(([field, message]) => ({
    field: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    message: Array.isArray(message) ? message[0] : message,
  }));
};

/**
 * Create error toast message
 * @param {Error} error - Error object
 * @returns {Object} Toast configuration
 */
export const createErrorToast = (error) => {
  const errorInfo = getErrorMessage(error);
  
  return {
    type: 'error',
    title: errorInfo.title,
    message: errorInfo.message,
    duration: 5000,
  };
};

/**
 * Log error with context for debugging
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @param {Object} additionalInfo - Additional debug information
 */
export const logError = (error, context, additionalInfo = {}) => {
  if (import.meta.env.DEV) {
    console.group(`❌ Error in ${context}`);
    console.error('Error:', error);
    console.log('Stack:', error.stack);
    console.log('Additional Info:', additionalInfo);
    if (error.response) {
      console.log('Response:', error.response);
    }
    console.groupEnd();
  }
};

export default {
  getErrorMessage,
  formatValidationErrors,
  createErrorToast,
  logError,
  ERROR_MESSAGES,
};
