import React, { useState } from 'react';
import { User } from 'lucide-react';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  status, 
  className = '', 
  fallback,
  role = 'neutral' // 'patient', 'doctor', 'admin', 'neutral'
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-xl',
    '3xl': 'w-32 h-32 text-2xl',
  };

  const statusColors = {
    online: 'bg-success',
    offline: 'bg-neutral-400',
    busy: 'bg-error',
    away: 'bg-warning',
  };

  const roleGradients = {
    patient: 'from-patient-400 to-patient-600',
    doctor: 'from-doctor-400 to-doctor-600',
    admin: 'from-admin-400 to-admin-600',
    neutral: 'from-neutral-400 to-neutral-600',
  };

  const statusSize = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
    '3xl': 'w-6 h-6',
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          relative overflow-hidden rounded-full flex items-center justify-center
          ${sizeClasses[size]}
          ${!src || imageError ? `bg-gradient-to-br ${roleGradients[role]} text-white shadow-inner` : 'bg-neutral-100'}
          ring-2 ring-white dark:ring-neutral-900 shadow-md transition-transform duration-300 hover:scale-105
        `}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <span className="font-bold tracking-wider font-heading">
            {fallback || getInitials(alt) || <User size={size === 'xs' ? 12 : 16} />}
          </span>
        )}
      </div>

      {status && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-neutral-900
            ${statusColors[status]}
            ${statusSize[size]}
            animate-pulse-slow
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
