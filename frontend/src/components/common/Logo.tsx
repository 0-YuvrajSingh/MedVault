import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Logo: React.FC<{ className?: string; variant?: 'light' | 'dark' }> = ({ className = '', variant = 'light' }) => (
  <Link to="/" className={`flex items-center gap-2.5 group ${className}`}>
    <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
      <Shield className="w-5 h-5 text-white" />
    </div>
    <div className="flex flex-col">
      <span className={`text-xl font-bold tracking-tight leading-none ${variant === 'dark' ? 'text-white' : 'text-slate-800'}`}>MedVault</span>
      <span className={`text-[10px] font-medium tracking-wider uppercase mt-0.5 ${variant === 'dark' ? 'text-white/70' : 'text-slate-500'}`}>Secure. Private.</span>
    </div>
  </Link>
);

export default Logo;
