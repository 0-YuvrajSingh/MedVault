/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Admin Theme - Power & Authority (Black & Orange)
        admin: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          dark: '#0f0f0f',
          accent: '#FF6B00',
        },

        // Doctor Theme - Wisdom & Luxury (Deep Violet & Lavender)
        doctor: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          dark: '#1e1b4b',
          accent: '#d8b4fe',
        },

        // Patient Theme - Health & Vitality (Emerald & Gold)
        patient: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          dark: '#022c22',
          accent: '#fcd34d',
        },

        // Dynamic Role Tokens
        role: {
          DEFAULT: 'var(--role-color)',
          tint: 'var(--role-tint)',
          text: 'var(--role-text)',
        },

        // Medical Category Colors for Stat Cards
        'med-teal': { bg: '#CCFBF1', icon: '#0D9488' },
        'med-blue': { bg: '#EFF6FF', icon: '#0369A1' },
        'med-amber': { bg: '#FEF3C7', icon: '#92400E' },
        'med-rose': { bg: '#FFE4E6', icon: '#BE123C' },

        // Global Surface Colors
        surface: {
          light: '#ffffff',
          DEFAULT: '#f8fafc',
          dark: '#09090b',
          card: 'rgba(255, 255, 255, 0.8)',
          'card-dark': 'rgba(9, 9, 11, 0.8)',
        },

        // Neutral Palette (Zinc)
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },

        // Semantic Colors
        success: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0',
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
        },
        warning: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
        },
        danger: {
          50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca',
          400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
        },
        info: '#3b82f6',
        border: '#e4e4e7',

        // Text semantic tokens
        'text-primary': '#0f172a',
        'text-secondary': '#475569',
        'text-muted': '#94a3b8',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
      },

      borderRadius: {
        'sm': '12px',
        'md': '16px',
        'lg': '20px',
      },

      boxShadow: {
        'sm': '0 1px 2px rgba(15, 23, 42, 0.04)',
        'md': '0 8px 24px rgba(15, 23, 42, 0.08)',
      },

      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
