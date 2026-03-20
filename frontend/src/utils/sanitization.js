/**
 * Input Sanitization Utility
 * Prevents XSS attacks by sanitizing user input
 */

/**
 * Escape HTML special characters to prevent XSS
 */
export const escapeHtml = (unsafe) => {
  if (typeof unsafe !== "string") return unsafe;

  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Sanitize text input by removing potential script tags
 */
export const sanitizeText = (text) => {
  if (typeof text !== "string") return text;

  // Remove script tags and their content
  let sanitized = text.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "");

  return sanitized;
};

/**
 * Sanitize email addresses
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== "string") return email;

  return email.toLowerCase().trim();
};

/**
 * Sanitize phone numbers (keep only digits and + symbol)
 */
export const sanitizePhone = (phone) => {
  if (typeof phone !== "string") return phone;

  return phone.replace(/[^\d+]/g, "");
};

/**
 * Sanitize URL to ensure it's safe
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== "string") return url;

  const trimmedUrl = url.trim();

  // Block javascript: and data: protocols
  if (
    trimmedUrl.toLowerCase().startsWith("javascript:") ||
    trimmedUrl.toLowerCase().startsWith("data:")
  ) {
    return "";
  }

  return trimmedUrl;
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) {
    return sanitizeText(obj);
  }

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (typeof value === "string") {
        sanitized[key] = sanitizeText(value);
      } else if (typeof value === "object") {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

/**
 * Validate and sanitize file name
 */
export const sanitizeFileName = (fileName) => {
  if (typeof fileName !== "string") return fileName;

  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\./g, "");

  // Remove special characters except dots, dashes, and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");

  return sanitized;
};

/**
 * Strip HTML tags completely
 */
export const stripHtml = (html) => {
  if (typeof html !== "string") return html;

  return html.replace(/<[^>]*>/g, "");
};

/**
 * Sanitize SQL input (basic protection, backend should also validate)
 */
export const sanitizeSql = (input) => {
  if (typeof input !== "string") return input;

  // Remove SQL comment markers
  let sanitized = input.replace(/--/g, "");
  sanitized = sanitized.replace(/\/\*/g, "");
  sanitized = sanitized.replace(/\*\//g, "");

  // Remove common SQL injection patterns
  sanitized = sanitized.replace(/['";]/g, "");

  return sanitized;
};

export default {
  escapeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeObject,
  sanitizeFileName,
  stripHtml,
  sanitizeSql,
};
