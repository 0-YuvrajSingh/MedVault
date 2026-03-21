// @ts-nocheck
// Role-based theme tokens and configuration
export const THEMES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
  DEFAULT: 'default'
};

export const themeConfig = {
  [THEMES.PATIENT]: {
    primary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    accent: {
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
    },
    gradient: 'from-teal-400 via-cyan-500 to-cyan-400',
    glow: 'shadow-glow-patient',
    mood: 'healing, fresh, clean',
  },
  
  [THEMES.DOCTOR]: {
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    accent: {
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
    },
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    glow: 'shadow-glow-doctor',
    mood: 'professional, confident, premium',
  },
  
  [THEMES.ADMIN]: {
    primary: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    accent: {
      600: '#d97706',
    },
    gradient: 'from-amber-500 via-orange-600 to-amber-600',
    glow: 'shadow-glow-admin',
    mood: 'authority, reliability, dashboard clarity',
  },
  
  [THEMES.DEFAULT]: {
    primary: {
      500: '#2563eb',
    },
    accent: {
      500: '#14b8a6',
    },
    gradient: 'from-blue-500 to-teal-500',
    glow: '',
    mood: 'neutral',
  },
};

// Get theme based on user role
export const getThemeForRole = (role) => {
  if (!role) return THEMES.DEFAULT;
  
  const roleUpper = role.toUpperCase();
  if (roleUpper === 'PATIENT') return THEMES.PATIENT;
  if (roleUpper === 'DOCTOR') return THEMES.DOCTOR;
  if (roleUpper === 'ADMIN') return THEMES.ADMIN;
  
  return THEMES.DEFAULT;
};

// Tailwind class utilities for theme-aware components
export const getThemeClasses = (theme) => {
  switch (theme) {
    case THEMES.PATIENT:
      return {
        primary: 'bg-patient-500 text-white',
        primaryHover: 'hover:bg-patient-600',
        primaryFocus: 'focus:ring-patient-400',
        accent: 'bg-patient-accent-500 text-white',
        accentHover: 'hover:bg-patient-accent-600',
        gradient: 'bg-gradient-to-r from-teal-400 via-cyan-500 to-cyan-400',
        text: 'text-patient-600',
        border: 'border-patient-500',
        ring: 'ring-patient-500',
        glow: 'shadow-glow-patient',
      };
      
    case THEMES.DOCTOR:
      return {
        primary: 'bg-doctor-500 text-white',
        primaryHover: 'hover:bg-doctor-600',
        primaryFocus: 'focus:ring-doctor-400',
        accent: 'bg-doctor-accent-500 text-white',
        accentHover: 'hover:bg-doctor-accent-600',
        gradient: 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
        text: 'text-doctor-600',
        border: 'border-doctor-500',
        ring: 'ring-doctor-500',
        glow: 'shadow-glow-doctor',
      };
      
    case THEMES.ADMIN:
      return {
        primary: 'bg-admin-500 text-white',
        primaryHover: 'hover:bg-admin-600',
        primaryFocus: 'focus:ring-admin-400',
        accent: 'bg-admin-600 text-white',
        accentHover: 'hover:bg-admin-700',
        gradient: 'bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600',
        text: 'text-admin-600',
        border: 'border-admin-500',
        ring: 'ring-admin-500',
        glow: 'shadow-glow-admin',
      };
      
    default:
      return {
        primary: 'bg-blue-600 text-white',
        primaryHover: 'hover:bg-blue-700',
        primaryFocus: 'focus:ring-blue-400',
        accent: 'bg-teal-600 text-white',
        accentHover: 'hover:bg-teal-700',
        gradient: 'bg-gradient-to-r from-blue-500 to-teal-500',
        text: 'text-blue-600',
        border: 'border-blue-500',
        ring: 'ring-blue-500',
        glow: '',
      };
  }
};

// Animation presets for framer-motion
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2, type: 'spring', stiffness: 300 },
  },
  
  slideRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

// Glassmorphism utility
export const glassEffect = 'backdrop-blur-md bg-white/70 dark:bg-neutral-900/70 border border-white/20';

// Card styles
export const cardStyles = {
  base: 'rounded-3xl shadow-lg transition-all duration-300',
  glass: `${glassEffect} rounded-3xl shadow-glass`,
  hover: 'hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl',
  premium: 'rounded-3xl shadow-2xl border border-neutral-200/50',
};

// Icon sizes (migrated from tokens/icon.js)
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  default: 20,
};

