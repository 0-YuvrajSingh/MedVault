import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

const StatCard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  iconColorClass, 
  iconBgClass, 
  borderColorClass, 
  delay = 0,
  variant = 'default',
  trend
}) => {
  if (variant === 'premium') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <Card variant="premium" hover className="h-full">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${iconBgClass}`}>
              <Icon className={`w-6 h-6 ${iconColorClass}`} />
            </div>
            {trend && (
               <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                 {trend}
               </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
            {value}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {title}
          </p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-2xl p-6 border-l-4 ${borderColorClass} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`size-12 rounded-xl ${iconBgClass} flex items-center justify-center`}>
          <Icon className={`size-6 ${iconColorClass}`} />
        </div>
      </div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
