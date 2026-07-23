import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} {...props} />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="p-4 border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 inline-block mr-6" style={{ width: `${14 + (i % 3) * 6}%` }} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-4 border-b border-slate-50 flex gap-6">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-4" style={{ width: `${20 + ((i + j) % 4) * 10}%` }} />
        ))}
      </div>
    ))}
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
    <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-6 w-24" />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-12 w-full">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="lg:col-span-2">
          <TableSkeleton rows={4} cols={3} />
        </div>
      </div>
    </div>
  );
};
