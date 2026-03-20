import React from 'react';

const Card = ({
  children,
  className = '',
  variant = 'default', // default, glass, premium
  hover = false,
  ...props
}) => {
  const variants = {
    default: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm',
    glass: 'backdrop-blur-xl bg-white/80 dark:bg-neutral-950/80 border border-white/20 dark:border-white/10 shadow-xl',
    premium: 'bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-lg',
  };

  const hoverEffects = hover
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-neutral-300 dark:hover:border-neutral-700'
    : '';

  return (
    <div
      className={`rounded-2xl p-6 ${variants[variant]} ${hoverEffects} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props} />
);

export const CardTitle = ({ className = '', ...props }) => (
  <h3 className={`font-semibold leading-none tracking-tight text-lg ${className}`} {...props} />
);

export const CardDescription = ({ className = '', ...props }) => (
  <p className={`text-sm text-neutral-500 dark:text-neutral-400 ${className}`} {...props} />
);

export const CardContent = ({ className = '', ...props }) => (
  <div className={`pt-0 ${className}`} {...props} />
);

export const CardFooter = ({ className = '', ...props }) => (
  <div className={`flex items-center pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 ${className}`} {...props} />
);

export default Card;
