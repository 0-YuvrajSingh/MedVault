import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Link to="/" className={`flex items-center gap-2 ${className}`}>
    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
    <span className="text-xl font-bold text-text-primary">MedVault</span>
  </Link>
);

export default Logo;
