// @ts-nocheck
import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Enhanced Button component with built-in loading states
 * Prevents double-clicks and shows visual feedback during async operations
 */
const LoadingButton = ({
  children,
  loading = false,
  disabled = false,
  loadingText = 'Loading...',
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const variants = {
    primary: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50',
    ghost: 'text-cyan-600 hover:bg-cyan-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const baseClasses = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
};

export default LoadingButton;
