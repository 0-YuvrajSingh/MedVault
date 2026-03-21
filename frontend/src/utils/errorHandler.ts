// @ts-nocheck
/**
 * Standardized Error Handler
 * Provides consistent error handling across the application
 */

import { logger } from "./logger";
import errorLogger from "./errorLogger";

/**
 * Error types
 */
export const ErrorType = {
  NETWORK: "NETWORK_ERROR",
  AUTH: "AUTH_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  SERVER: "SERVER_ERROR",
  FORBIDDEN: "FORBIDDEN",
  UNKNOWN: "UNKNOWN_ERROR",
};

/**
 * Extract user-friendly error message from error object
 */
export const getErrorMessage = (error) => {
  // API error with response
  if (error.response) {
    const { data, status } = error.response;

    // Check for message in various response formats
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (typeof data === "string") return data;

    // Default messages based on status code
    switch (status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Authentication required. Please log in.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "A conflict occurred. The resource may already exist.";
      case 422:
        return "Validation failed. Please check your input.";
      case 500:
        return "Server error. Please try again later.";
      case 503:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return `Request failed with status ${status}`;
    }
  }

  // Network error (no response from server)
  if (error.request) {
    return "Network error. Please check your internet connection.";
  }

  // Error message directly on error object
  if (error.message) {
    return error.message;
  }

  // Fallback
  return "An unexpected error occurred. Please try again.";
};

/**
 * Determine error type from error object
 */
export const getErrorType = (error) => {
  if (!error.response) {
    return ErrorType.NETWORK;
  }

  const status = error.response?.status;

  switch (status) {
    case 401:
      return ErrorType.AUTH;
    case 403:
      return ErrorType.FORBIDDEN;
    case 404:
      return ErrorType.NOT_FOUND;
    case 400:
    case 422:
      return ErrorType.VALIDATION;
    case 500:
    case 502:
    case 503:
      return ErrorType.SERVER;
    default:
      return ErrorType.UNKNOWN;
  }
};

/**
 * Handle error with toast notification
 */
export const handleError = (error, toast, customMessage = null) => {
  const message = customMessage || getErrorMessage(error);
  const type = getErrorType(error);

  // Log error
  logger.error("Error occurred:", {
    message,
    type,
    error: error.response?.data || error.message,
  });

  // Log to error tracking service
  errorLogger.logError(error, "handleError", { customMessage });

  // Show toast notification if toast is provided
  if (toast) {
    const title = getErrorTitle(type);
    toast.error(title, message);
  }

  return { message, type };
};

/**
 * Get error title based on type
 */
const getErrorTitle = (type) => {
  switch (type) {
    case ErrorType.NETWORK:
      return "Network Error";
    case ErrorType.AUTH:
      return "Authentication Error";
    case ErrorType.VALIDATION:
      return "Validation Error";
    case ErrorType.NOT_FOUND:
      return "Not Found";
    case ErrorType.SERVER:
      return "Server Error";
    case ErrorType.FORBIDDEN:
      return "Access Denied";
    default:
      return "Error";
  }
};

/**
 * Handle async operations with try-catch
 */
export const withErrorHandler = async (asyncFn, toast, options = {}) => {
  const {
    onError,
    onSuccess,
    successMessage,
    errorMessage,
    throwError = false,
  } = options;

  try {
    const result = await asyncFn();

    if (onSuccess) {
      onSuccess(result);
    }

    if (successMessage && toast) {
      toast.success("Success", successMessage);
    }

    return { data: result, error: null };
  } catch (error) {
    const errorDetails = handleError(error, toast, errorMessage);

    if (onError) {
      onError(error, errorDetails);
    }

    if (throwError) {
      throw error;
    }

    return { data: null, error: errorDetails };
  }
};

/**
 * Create error handler for form submissions
 */
export const createFormErrorHandler = (setError) => {
  return (error, fieldName = null) => {
    const message = getErrorMessage(error);

    if (fieldName && setError) {
      // Set field-specific error for react-hook-form
      setError(fieldName, {
        type: "manual",
        message,
      });
    }

    return message;
  };
};

/**
 * Retry failed operation
 */
export const retryOperation = async (
  operation,
  maxRetries = 3,
  delay = 1000,
  backoff = 2
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      logger.warn(`Operation failed, attempt ${attempt}/${maxRetries}`, {
        error: error.message,
      });

      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
};

/**
 * Check if error is recoverable
 */
export const isRecoverableError = (error) => {
  if (!error.response) return true; // Network errors are recoverable

  const status = error.response.status;

  // 4xx errors are generally not recoverable (except 408, 429)
  // 5xx errors are potentially recoverable
  return status >= 500 || status === 408 || status === 429;
};

export default {
  ErrorType,
  getErrorMessage,
  getErrorType,
  handleError,
  withErrorHandler,
  createFormErrorHandler,
  retryOperation,
  isRecoverableError,
};
