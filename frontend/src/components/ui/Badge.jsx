import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getThemeClasses } from '../../styles/themes';

/**
 * Premium Badge Component
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const { currentTheme } = useTheme();
  const themeClasses = getThemeClasses(currentTheme);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const variantClasses = {
    default: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300',
    primary: `${themeClasses.primary} text-white`,
    success: 'bg-success/10 text-success border border-success/20',
    error: 'bg-error/10 text-error border border-error/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    info: 'bg-info/10 text-info border border-info/20',
    outline: `border-2 ${themeClasses.border} ${themeClasses.text}`,
  };

  const combinedClasses = `
    inline-flex items-center justify-center font-medium rounded-full
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  return (
    <span className={combinedClasses}>
      {children}
    </span>
  );
};

export default Badge;
