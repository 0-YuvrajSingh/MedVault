import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`card-surface bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}
      data-interactive={hover || undefined}
      {...props}
    >
      {children}
    </div>
  );
};
