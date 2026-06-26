import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC<{ className?: string; variant?: 'light' | 'dark' }> = ({ className = '', variant = 'light' }) => (
  <Link to="/" className={`flex items-center gap-2 ${className}`}>
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      {/* Background Shield Outline */}
      <svg className={`absolute inset-0 w-full h-full ${variant === 'dark' ? 'text-white' : 'text-[#0F4C81]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      {/* Medical Cross */}
      <div className={`absolute top-[18%] w-5 h-5 ${variant === 'dark' ? 'text-blue-200' : 'text-[#0369A1]'}`}>
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 10h-5V5h-4v5H5v4h5v5h4v-5h5v-4z" />
        </svg>
      </div>
      {/* Folder with Lock */}
      <div className={`absolute bottom-[20%] w-6 h-5 ${variant === 'dark' ? 'text-white/90' : 'text-[#0F4C81]'}`}>
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pt-[3px]">
          <svg className={`w-2.5 h-2.5 ${variant === 'dark' ? 'text-[#0F4C81]' : 'text-white'}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
        </div>
      </div>
    </div>
    <div className="flex flex-col justify-center">
      <span className={`text-2xl font-extrabold tracking-tight leading-none ${variant === 'dark' ? 'text-white' : 'text-[#0F4C81]'}`}>MedVault</span>
      <span className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${variant === 'dark' ? 'text-blue-200/80' : 'text-gray-500'}`}>Secure. Private. Always.</span>
    </div>
  </Link>
);

export default Logo;
