/**
 * Logger Utility
 * Provides development-only logging to prevent console statements in production
 * Usage: import { logger } from './utils/logger'
 */

const isDevelopment =
  import.meta.env.DEV || import.meta.env.MODE === "development";

class Logger {
  /**
   * Log general information (only in development)
   */
  log(...args) {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Log errors (always logged, but formatted differently in production)
   */
  error(...args) {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, keep structured error logging minimal.
      console.error("[ERROR]:", ...args);
    }
  }

  /**
   * Log warnings (only in development)
   */
  warn(...args) {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  /**
   * Log debug information (only in development)
   */
  debug(...args) {
    if (isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * Log table data (only in development)
   */
  table(data) {
    if (isDevelopment) {
      console.table(data);
    }
  }

  /**
   * Start performance timing (only in development)
   */
  time(label) {
    if (isDevelopment) {
      console.time(label);
    }
  }

  /**
   * End performance timing (only in development)
   */
  timeEnd(label) {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  }

  /**
   * Group console logs (only in development)
   */
  group(label) {
    if (isDevelopment) {
      console.group(label);
    }
  }

  /**
   * End console group (only in development)
   */
  groupEnd() {
    if (isDevelopment) {
      console.groupEnd();
    }
  }
}

export const logger = new Logger();
export default logger;
