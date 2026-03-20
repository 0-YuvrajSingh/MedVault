import React from 'react';
import { motion } from 'framer-motion';

/**
 * Skeleton loader component for loading states
 * Provides various variants for different content types
 */
const Skeleton = ({ 
  variant = 'text', 
  width = '100%', 
  height, 
  count = 1, 
  className = '',
  animate = true 
}) => {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-8 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'h-32 rounded-2xl',
    avatar: 'rounded-full',
  };

  const defaultHeights = {
    text: '1rem',
    title: '2rem',
    circular: '3rem',
    rectangular: '8rem',
    card: '8rem',
    avatar: '3rem',
  };

  const skeletonHeight = height || defaultHeights[variant] || '1rem';
  const skeletonClass = variants[variant] || variants.text;

  const pulseAnimation = animate ? {
    animate: {
      opacity: [0.5, 1, 0.5],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  } : {};

  const SkeletonElement = () => (
    <motion.div
      {...pulseAnimation}
      className={`bg-neutral-200 dark:bg-neutral-700 ${skeletonClass} ${className}`}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof skeletonHeight === 'number' ? `${skeletonHeight}px` : skeletonHeight,
      }}
    />
  );

  if (count === 1) {
    return <SkeletonElement />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonElement key={index} />
      ))}
    </div>
  );
};

// Preset skeleton patterns for common use cases
export const CardSkeleton = ({ count = 1 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="title" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
        <Skeleton variant="text" count={3} />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="title" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" />
        ))}
      </div>
    ))}
  </div>
);

export const StatCardSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 space-y-3">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="title" width="50%" />
        <Skeleton variant="text" width="70%" />
      </div>
    ))}
  </div>
);

export const AppointmentListSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-neutral-800 rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="title" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="25%" />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton variant="title" width={250} />
        <Skeleton variant="text" width={180} />
      </div>
      <Skeleton variant="rectangular" width={120} height={40} />
    </div>
    
    <StatCardSkeleton count={4} />
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton count={1} />
      <CardSkeleton count={1} />
    </div>
    
    <AppointmentListSkeleton count={3} />
  </div>
);

export default Skeleton;
