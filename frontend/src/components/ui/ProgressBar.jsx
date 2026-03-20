import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getThemeClasses } from '../../styles/themes';

/**
 * Premium Progress Bar Component
 */
const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  className = '',
}) => {
  const { currentTheme } = useTheme();
  const themeClasses = getThemeClasses(currentTheme);

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantClasses = {
    primary: themeClasses.primary,
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
    info: 'bg-info',
  };

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </span>
          {showLabel && (
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full ${variantClasses[variant]} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Circular Progress Component
 */
export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 64,
  strokeWidth = 6,
  variant = 'primary',
  showLabel = true,
  className = '',
}) => {
  const { currentTheme } = useTheme();
  const themeClasses = getThemeClasses(currentTheme);

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-current ' + themeClasses.text,
    success: 'stroke-success',
    error: 'stroke-error',
    warning: 'stroke-warning',
    info: 'stroke-info',
  };

  return (
    <div className={`relative inline-flex ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-neutral-200 dark:stroke-neutral-700 fill-none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`fill-none transition-all duration-500 ${colorClasses[variant]}`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
