import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  showIcon = true,
  className = '',
}) => {
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgClass: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      iconClass: 'text-green-500 dark:text-green-400',
      textClass: 'text-green-800 dark:text-green-200',
    },
    error: {
      icon: XCircle,
      bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      iconClass: 'text-red-500 dark:text-red-400',
      textClass: 'text-red-800 dark:text-red-200',
    },
    warning: {
      icon: AlertCircle,
      bgClass: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      iconClass: 'text-yellow-500 dark:text-yellow-400',
      textClass: 'text-yellow-800 dark:text-yellow-200',
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      iconClass: 'text-blue-500 dark:text-blue-400',
      textClass: 'text-blue-800 dark:text-blue-200',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className={`
          relative rounded-xl border p-4 ${config.bgClass} ${className} shadow-sm
        `}
      >
        <div className="flex items-start gap-3">
          {showIcon && (
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
          )}
          
          <div className="flex-1">
            {title && (
              <h4 className={`font-semibold text-sm mb-1 ${config.textClass}`}>
                {title}
              </h4>
            )}
            {message && (
              <p className={`text-sm ${config.textClass} opacity-90`}>
                {message}
              </p>
            )}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${config.textClass}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Alert;
