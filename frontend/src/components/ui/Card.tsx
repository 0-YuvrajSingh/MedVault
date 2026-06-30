import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', elevated = false, ...props }) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 ${elevated ? 'shadow-md hover:shadow-lg transition-shadow' : 'shadow-sm'} ${className}`} {...props}>
      {children}
    </div>
  );
};
