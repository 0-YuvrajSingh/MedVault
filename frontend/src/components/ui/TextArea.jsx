import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const TextArea = forwardRef(({
  label,
  error,
  helperText,
  rows = 4,
  fullWidth = false,
  resize = true,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`space-y-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 ml-1">
          {label}
        </label>
      )}
      
      <div className="relative group">
        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 
            rounded-xl py-3 px-4 text-neutral-900 dark:text-white placeholder:text-neutral-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-admin-500/20 focus:border-admin-500 focus:bg-white dark:focus:bg-black
            disabled:opacity-50 disabled:cursor-not-allowed
            ${resize ? 'resize-y' : 'resize-none'}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        
        {error && (
          <div className="absolute right-3 top-3 text-red-500 animate-in fade-in zoom-in duration-200">
            <AlertCircle size={18} />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500 ml-1 animate-in slide-in-from-top-1 duration-200">
          {error.message || error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
