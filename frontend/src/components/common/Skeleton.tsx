import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-12 w-full">
      {/* Hero Skeleton */}
      <Skeleton className="h-48 w-full rounded-2xl" />
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>

      {/* Two Column Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
};
