import React from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, Search, Inbox } from 'lucide-react';
import Button from './Button';

/**
 * Premium Empty State Component
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data found',
  description,
  action,
  actionLabel,
  onAction,
  variant = 'default',
  className = '',
}) => {
  const variantConfig = {
    default: {
      Icon: Inbox,
      iconClass: 'text-neutral-400',
    },
    search: {
      Icon: Search,
      iconClass: 'text-neutral-400',
    },
    error: {
      Icon: FileQuestion,
      iconClass: 'text-error',
    },
  };

  const DisplayIcon = Icon || variantConfig[variant].Icon;
  const iconClass = variantConfig[variant]?.iconClass || 'text-neutral-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <div className={`w-16 h-16 mb-4 ${iconClass}`}>
        <DisplayIcon className="w-full h-full" strokeWidth={1.5} />
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mb-6">
          {description}
        </p>
      )}

      {(action || (actionLabel && onAction)) && (
        <div>
          {action || (
            <Button onClick={onAction} variant="primary">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
