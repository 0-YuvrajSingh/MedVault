// @ts-nocheck
import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg
  loading = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  iconLeft, // Alias for leftIcon
  iconRight, // Alias for rightIcon
  className = '',
  disabled,
  role = 'neutral', // patient, doctor, admin, neutral
  fullWidth = false,
  as: Component = 'button',
  ...props
}) => {
  const isLoadingState = loading || isLoading;
  
  // Use iconLeft/iconRight as aliases if leftIcon/rightIcon not provided
  const LeftIconComponent = leftIcon || iconLeft;
  const RightIconComponent = rightIcon || iconRight;
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
  };

  const roleGradients = {
    patient: 'from-patient-600 to-patient-400 hover:to-patient-300 shadow-patient-500/25 hover:shadow-patient-500/40',
    doctor: 'from-doctor-600 to-doctor-400 hover:to-doctor-300 shadow-doctor-500/25 hover:shadow-doctor-500/40',
    admin: 'from-admin-600 to-admin-400 hover:to-admin-300 shadow-admin-500/25 hover:shadow-admin-500/40',
    neutral: 'from-neutral-800 to-neutral-600 hover:to-neutral-500 shadow-neutral-500/25 hover:shadow-neutral-500/40',
  };

  const variants = {
    primary: `bg-gradient-to-r text-white shadow-lg ${roleGradients[role] || roleGradients.neutral}`,
    secondary: 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-sm',
    outline: `bg-transparent border-2 hover:bg-opacity-10 ${
      role === 'patient' ? 'border-patient-500 text-patient-600 hover:bg-patient-50' :
      role === 'doctor' ? 'border-doctor-500 text-doctor-600 hover:bg-doctor-50' :
      role === 'admin' ? 'border-admin-500 text-admin-600 hover:bg-admin-50' :
      'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
    }`,
    ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40',
  };

  const sharedProps = {
    className: `${baseStyles} ${sizes[size]} ${variants[variant]}${fullWidth ? ' w-full' : ''} ${className}`,
    disabled: disabled || isLoadingState,
    ...props,
  };

  // Remove 'disabled' prop for non-button elements (e.g., Link)
  if (Component !== 'button') {
    delete sharedProps.disabled;
  }

  return (
    <Component {...sharedProps}>
      {isLoadingState && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoadingState && LeftIconComponent && typeof LeftIconComponent === 'function' && <LeftIconComponent className="w-4 h-4" />}
      {children}
      {!isLoadingState && RightIconComponent && typeof RightIconComponent === 'function' && <RightIconComponent className="w-4 h-4" />}
    </Component>
  );
};

export default Button;
