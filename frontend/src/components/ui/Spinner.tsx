// @ts-nocheck
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getThemeClasses } from '../../styles/themes';

/**
 * Premium Loading Spinner Component
 */
const Spinner = ({ size = 'md', variant = 'primary', className = '' }) => {
  const { currentTheme } = useTheme();
  const themeClasses = getThemeClasses(currentTheme);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const variantClasses = {
    primary: themeClasses.text,
    white: 'text-white',
    current: 'text-current',
  };

  return (
    <div className={`inline-block ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

/**
 * Full Page Loading Component
 */
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-neutral-900 z-50">
      <Spinner size="xl" />
      <p className="mt-4 text-neutral-600 dark:text-neutral-400">{message}</p>
    </div>
  );
};

/**
 * Skeleton Loader Component
 */
export const Skeleton = ({ className = '', width, height, circle = false }) => {
  const roundedClass = circle ? 'rounded-full' : 'rounded-xl';
  const widthClass = width ? `w-[${width}]` : 'w-full';
  const heightClass = height ? `h-[${height}]` : 'h-4';

  return (
    <div
      className={`skeleton bg-neutral-200 dark:bg-neutral-700 ${roundedClass} ${widthClass} ${heightClass} ${className}`}
    />
  );
};

export default Spinner;
