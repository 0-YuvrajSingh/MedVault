// @ts-nocheck
import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getThemeClasses } from '../../styles/themes';

/**
 * Premium Radio Button Component
 */
const Radio = forwardRef(({
  label,
  description,
  error,
  className = '',
  ...props
}, ref) => {
  const { currentTheme } = useTheme();
  const themeClasses = getThemeClasses(currentTheme);

  return (
    <div className={className}>
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="radio"
            className="sr-only peer"
            {...props}
          />
          <div className={`
            w-5 h-5 rounded-full border-2 transition-all duration-200
            ${error ? 'border-error' : 'border-neutral-300 dark:border-neutral-600'}
            peer-checked:border-transparent
            peer-focus:ring-2 peer-focus:ring-offset-2 ${themeClasses.primaryFocus}
            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
            group-hover:border-neutral-400 dark:group-hover:border-neutral-500
          `}>
            <div className={`
              w-full h-full rounded-full scale-0 transition-transform duration-200
              peer-checked:scale-50 ${themeClasses.primary}
            `} />
          </div>
        </div>

        <div className="flex-1">
          {label && (
            <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {description}
            </span>
          )}
        </div>
      </label>

      {error && (
        <p className="mt-1.5 ml-8 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

export default Radio;
