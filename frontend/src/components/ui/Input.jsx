import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  leftIcon,
  rightIcon,
  fullWidth,
  className = '',
  type = 'text',
  onRightIconClick,
  ...props
}, ref) => {
  // Use leftIcon or rightIcon if provided, otherwise use icon
  const LeftIconComponent = leftIcon || Icon;
  const RightIconComponent = rightIcon;
  
  return (
    <div className={`space-y-1.5 ${fullWidth ? 'w-full' : 'w-full'}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 ml-1">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {typeof LeftIconComponent === 'function' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 group-focus-within:text-admin-500 transition-colors">
            <LeftIconComponent size={20} strokeWidth={2} />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={`
            w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 
            rounded-xl py-3 px-4 text-neutral-900 dark:text-white placeholder:text-neutral-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 focus:bg-white dark:focus:bg-black
            disabled:opacity-50 disabled:cursor-not-allowed
            ${LeftIconComponent ? 'pl-10' : ''}
            ${RightIconComponent ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        
        {typeof RightIconComponent === 'function' && !error && (
          <button
            type="button"
            onClick={onRightIconClick}
            tabIndex={-1}
            className="absolute right-3 inset-y-0 my-auto flex items-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors p-0 bg-transparent border-0"
            style={{ lineHeight: 0, height: 'fit-content' }}
          >
            <RightIconComponent size={20} strokeWidth={2} />
          </button>
        )}
        
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 animate-in fade-in zoom-in duration-200">
            <AlertCircle size={20} strokeWidth={2} />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500 ml-1 animate-in slide-in-from-top-1 duration-200">
          {error.message || error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
