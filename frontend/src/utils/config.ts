// @ts-nocheck
/**
 * Environment Configuration Helper
 * Centralized access to environment variables with type safety and defaults
 */

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key, defaultValue = "") => {
  return import.meta.env[key] || defaultValue;
};

/**
 * Check if running in development mode
 */
export const isDevelopment = () => {
  return import.meta.env.DEV || import.meta.env.MODE === "development";
};

/**
 * Check if running in production mode
 */
export const isProduction = () => {
  return import.meta.env.PROD || import.meta.env.MODE === "production";
};

/**
 * API Configuration
 */
export const config = {
  // API URLs
  apiBaseUrl: getEnvVar("VITE_API_BASE_URL", "http://localhost:8080/api"),

  // Environment
  env: getEnvVar("VITE_ENV", "development"),
  isDev: isDevelopment(),
  isProd: isProduction(),

  // Feature Flags
  enableAnalytics: getEnvVar("VITE_ENABLE_ANALYTICS", "false") === "true",
  notificationPollMs: parseInt(getEnvVar("VITE_NOTIFICATION_POLL_MS", "30000")),

  // File Upload Limits (in bytes)
  maxFileSize: parseInt(getEnvVar("VITE_MAX_FILE_SIZE", "10")) * 1024 * 1024, // Convert MB to bytes
  maxImageSize: parseInt(getEnvVar("VITE_MAX_IMAGE_SIZE", "5")) * 1024 * 1024,

  // Pagination
  defaultPageSize: parseInt(getEnvVar("VITE_DEFAULT_PAGE_SIZE", "10")),

  // Session
  sessionTimeout: parseInt(getEnvVar("VITE_SESSION_TIMEOUT", "30")) * 60 * 1000, // Convert minutes to ms

  // Analytics
  gaTrackingId: getEnvVar("VITE_GA_TRACKING_ID", ""),
};

/**
 * Allowed file types for uploads
 */
export const allowedFileTypes = {
  images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
  medicalDocuments: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/dicom", // Medical imaging format
  ],
};

/**
 * File type categories
 */
export const fileTypeCategories = {
  PROFILE_PICTURE: {
    maxSize: config.maxImageSize,
    allowedTypes: allowedFileTypes.images,
    label: "Profile Picture",
  },
  MEDICAL_DOCUMENT: {
    maxSize: config.maxFileSize,
    allowedTypes: allowedFileTypes.medicalDocuments,
    label: "Medical Document",
  },
  LAB_REPORT: {
    maxSize: config.maxFileSize,
    allowedTypes: [...allowedFileTypes.documents, ...allowedFileTypes.images],
    label: "Lab Report",
  },
};

/**
 * Validate environment configuration
 */
export const validateConfig = () => {
  const errors = [];

  if (!config.apiBaseUrl) {
    errors.push("VITE_API_BASE_URL is not configured");
  }

  if (config.enableAnalytics && !config.gaTrackingId) {
    errors.push("VITE_GA_TRACKING_ID is required when analytics is enabled");
  }

  if (errors.length > 0) {
    if (isDevelopment()) {
      console.error("Configuration Errors:", errors);
    }
    return false;
  }

  return true;
};

/**
 * Log configuration (in development only)
 */
export const logConfig = () => {
  if (isDevelopment()) {
    console.group("🔧 Environment Configuration");
    console.log("Environment:", config.env);
    console.log("API Base URL:", config.apiBaseUrl);
    console.log("Features:", {
      analytics: config.enableAnalytics,
      notificationPollingMs: config.notificationPollMs,
    });
    console.log("File Limits:", {
      maxFileSize: `${config.maxFileSize / 1024 / 1024}MB`,
      maxImageSize: `${config.maxImageSize / 1024 / 1024}MB`,
    });
    console.groupEnd();
  }
};

export default config;
