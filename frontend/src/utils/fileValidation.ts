// @ts-nocheck
/**
 * File Upload Validation Utility
 * Provides comprehensive file validation for security and size constraints
 */

import config, { fileTypeCategories } from "./config";
import { logger } from "./logger";
import { sanitizeFileName } from "./sanitization";

/**
 * Validation result structure
 */
class ValidationResult {
  constructor(isValid, errors = []) {
    this.isValid = isValid;
    this.errors = errors;
  }

  addError(error) {
    this.errors.push(error);
    this.isValid = false;
  }

  getErrorMessage() {
    return this.errors.join("; ");
  }
}

/**
 * Validate file size
 */
export const validateFileSize = (file, maxSize) => {
  const result = new ValidationResult(true);

  if (!file) {
    result.addError("No file provided");
    return result;
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    result.addError(
      `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
    );
  }

  return result;
};

/**
 * Validate file type by MIME type
 */
export const validateFileType = (file, allowedTypes) => {
  const result = new ValidationResult(true);

  if (!file) {
    result.addError("No file provided");
    return result;
  }

  if (!file.type) {
    result.addError("File type could not be determined");
    return result;
  }

  const isAllowed = allowedTypes.some((allowedType) => {
    // Support wildcards like 'image/*'
    if (allowedType.endsWith("/*")) {
      const category = allowedType.split("/")[0];
      return file.type.startsWith(category + "/");
    }
    return file.type === allowedType;
  });

  if (!isAllowed) {
    result.addError(
      `File type "${
        file.type
      }" is not allowed. Allowed types: ${allowedTypes.join(", ")}`
    );
  }

  return result;
};

/**
 * Validate file extension
 */
export const validateFileExtension = (file, allowedExtensions) => {
  const result = new ValidationResult(true);

  if (!file || !file.name) {
    result.addError("Invalid file or filename");
    return result;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension) {
    result.addError("File has no extension");
    return result;
  }

  const normalizedExtensions = allowedExtensions.map((ext) =>
    ext.toLowerCase().replace(".", "")
  );

  if (!normalizedExtensions.includes(extension)) {
    result.addError(
      `File extension ".${extension}" is not allowed. Allowed extensions: ${allowedExtensions.join(
        ", "
      )}`
    );
  }

  return result;
};

/**
 * Validate file name for security
 */
export const validateFileName = (file) => {
  const result = new ValidationResult(true);

  if (!file || !file.name) {
    result.addError("Invalid file or filename");
    return result;
  }

  const fileName = file.name;

  // Check for path traversal attempts
  if (
    fileName.includes("..") ||
    fileName.includes("/") ||
    fileName.includes("\\")
  ) {
    result.addError(
      "File name contains invalid characters (path traversal attempt)"
    );
  }

  // Check for null bytes
  if (fileName.includes("\0")) {
    result.addError("File name contains null bytes");
  }

  // Check for excessively long filename
  if (fileName.length > 255) {
    result.addError("File name is too long (maximum 255 characters)");
  }

  // Check for empty filename
  if (fileName.trim().length === 0) {
    result.addError("File name is empty");
  }

  return result;
};

/**
 * Validate image file (additional checks for images)
 */
export const validateImageFile = async (
  file,
  maxWidth = null,
  maxHeight = null
) => {
  const result = new ValidationResult(true);

  if (!file || !file.type.startsWith("image/")) {
    result.addError("Not a valid image file");
    return result;
  }

  // Validate dimensions if specified
  if (maxWidth || maxHeight) {
    try {
      const dimensions = await getImageDimensions(file);

      if (maxWidth && dimensions.width > maxWidth) {
        result.addError(
          `Image width (${dimensions.width}px) exceeds maximum (${maxWidth}px)`
        );
      }

      if (maxHeight && dimensions.height > maxHeight) {
        result.addError(
          `Image height (${dimensions.height}px) exceeds maximum (${maxHeight}px)`
        );
      }
    } catch (error) {
      result.addError("Failed to read image dimensions");
      logger.error("Image dimension validation error:", error);
    }
  }

  return result;
};

/**
 * Get image dimensions
 */
const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};

/**
 * Validate file by category (from config)
 */
export const validateFileByCategory = (file, categoryKey) => {
  const result = new ValidationResult(true);

  const category = fileTypeCategories[categoryKey];

  if (!category) {
    result.addError(`Invalid file category: ${categoryKey}`);
    return result;
  }

  // Validate file name
  const nameValidation = validateFileName(file);
  if (!nameValidation.isValid) {
    result.errors.push(...nameValidation.errors);
    result.isValid = false;
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, category.maxSize);
  if (!sizeValidation.isValid) {
    result.errors.push(...sizeValidation.errors);
    result.isValid = false;
  }

  // Validate file type
  const typeValidation = validateFileType(file, category.allowedTypes);
  if (!typeValidation.isValid) {
    result.errors.push(...typeValidation.errors);
    result.isValid = false;
  }

  return result;
};

/**
 * Comprehensive file validation
 */
export const validateFile = async (file, options = {}) => {
  const {
    maxSize = config.maxFileSize,
    allowedTypes = null,
    allowedExtensions = null,
    category = null,
    validateAsImage = false,
    maxImageWidth = null,
    maxImageHeight = null,
  } = options;

  const result = new ValidationResult(true);

  // Basic file check
  if (!file) {
    result.addError("No file provided");
    return result;
  }

  // Use category validation if specified
  if (category) {
    const categoryValidation = validateFileByCategory(file, category);
    if (!categoryValidation.isValid) {
      return categoryValidation;
    }
  } else {
    // Manual validation
    const nameValidation = validateFileName(file);
    if (!nameValidation.isValid) {
      result.errors.push(...nameValidation.errors);
      result.isValid = false;
    }

    const sizeValidation = validateFileSize(file, maxSize);
    if (!sizeValidation.isValid) {
      result.errors.push(...sizeValidation.errors);
      result.isValid = false;
    }

    if (allowedTypes) {
      const typeValidation = validateFileType(file, allowedTypes);
      if (!typeValidation.isValid) {
        result.errors.push(...typeValidation.errors);
        result.isValid = false;
      }
    }

    if (allowedExtensions) {
      const extValidation = validateFileExtension(file, allowedExtensions);
      if (!extValidation.isValid) {
        result.errors.push(...extValidation.errors);
        result.isValid = false;
      }
    }
  }

  // Image-specific validation
  if (validateAsImage) {
    const imageValidation = await validateImageFile(
      file,
      maxImageWidth,
      maxImageHeight
    );
    if (!imageValidation.isValid) {
      result.errors.push(...imageValidation.errors);
      result.isValid = false;
    }
  }

  return result;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Get safe file name
 */
export const getSafeFileName = (file) => {
  if (!file || !file.name) return "unnamed";
  return sanitizeFileName(file.name);
};

/**
 * Check if file is an image
 */
export const isImageFile = (file) => {
  return file && file.type && file.type.startsWith("image/");
};

/**
 * Check if file is a PDF
 */
export const isPdfFile = (file) => {
  return file && file.type === "application/pdf";
};

/**
 * Get file extension
 */
export const getFileExtension = (file) => {
  if (!file || !file.name) return "";
  return file.name.split(".").pop()?.toLowerCase() || "";
};

export default {
  validateFile,
  validateFileByCategory,
  validateFileSize,
  validateFileType,
  validateFileExtension,
  validateFileName,
  validateImageFile,
  formatFileSize,
  getSafeFileName,
  isImageFile,
  isPdfFile,
  getFileExtension,
};
