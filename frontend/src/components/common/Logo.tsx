import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC<{ className?: string; variant?: 'light' | 'dark' }> = ({ className = '', variant = 'light' }) => (
  <Link to="/" className={`flex items-center gap-3 ${className}`}>
    <div className={`relative w-10 h-10 flex items-center justify-center shrink-0 rounded-lg border border-slate-200 transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5 bg-gradient-to-tr from-blue-600 to-teal-400 shadow-md`}>
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 10h-5V5h-4v5H5v4h5v5h4v-5h5v-4z" />
      </svg>
    </div>
    <div className="flex flex-col justify-center">
      <span className={`text-2xl font-black tracking-tighter leading-none ${variant === 'dark' ? 'text-white' : 'text-black'}`}>MedVault</span>
      <span className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${variant === 'dark' ? 'text-white/80' : 'text-black'}`}>Secure. Private.</span>
    </div>
  </Link>
);

export default Logo;
