import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass?: string;
  iconBgClass?: string;
  borderColorClass?: string;
  delay?: number;
  variant?: 'default' | 'premium';
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = memo(({
  title, value, icon: Icon,
  iconColorClass = 'text-blue-600',
  iconBgClass = 'bg-blue-50',
  borderColorClass = 'border-blue-500',
  delay = 0, variant = 'default', trend,
}) => {
  if (variant === 'premium') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${iconBgClass}`}>
            <Icon className={`w-5 h-5 ${iconColorClass}`} />
          </div>
          {trend && <span className="text-xs font-medium text-neutral-400">{trend}</span>}
        </div>
        <p className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">{value}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white dark:bg-neutral-900 rounded-2xl p-5 border-l-4 ${borderColorClass} border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBgClass}`}>
          <Icon className={`w-5 h-5 ${iconColorClass}`} />
        </div>
      </div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';
export default StatCard;
