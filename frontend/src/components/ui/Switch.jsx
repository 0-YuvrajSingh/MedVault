import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getThemeClasses } from '../../styles/themes';

/**
 * Premium Switch/Toggle Component
 */
const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  size = 'md',
  className = '',
  ...props
}) => {
  const { currentTheme } = useTheme();
  const themeClasses = getThemeClasses(currentTheme);

  const sizeClasses = {
    sm: {
      track: 'w-8 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-3',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  const { track, thumb, translate } = sizeClasses[size];

  return (
    <label className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          className={`
            ${track}
            rounded-full
            transition-colors duration-200
            ${checked ? themeClasses.primary : 'bg-neutral-300 dark:bg-neutral-600'}
            peer-focus:ring-2 peer-focus:ring-offset-2 ${themeClasses.primaryFocus}
          `}
        >
          <div
            className={`
              ${thumb}
              absolute top-0.5 left-0.5
              bg-white rounded-full
              transition-transform duration-200
              ${checked ? translate : 'translate-x-0'}
              shadow-md
            `}
          />
        </div>
      </div>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

export default Switch;
