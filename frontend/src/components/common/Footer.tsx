import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FooterProps {
  variant?: 'public' | 'dashboard';
}

const Footer: React.FC<FooterProps> = ({ variant = 'public' }) => {
  const currentYear = new Date().getFullYear();

  if (variant === 'dashboard') {
    return (
      <footer className="mt-auto py-6 text-center text-xs text-gray-400 font-medium border-t border-gray-100 flex flex-col items-center justify-center gap-1">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>MedVault Secure Systems</span>
        </div>
        <p>&copy; {currentYear} MedVault Inc. All rights reserved.</p>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#0369A1] rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-[#0F4C81] tracking-tight">MedVault</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-6">
              A modern, secure platform connecting patients and healthcare providers through encrypted medical record management.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 inline-block mx-0.5" /> for Healthcare
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li><Link to="/login" className="hover:text-[#0369A1] transition-colors">Doctor Portal</Link></li>
              <li><Link to="/login" className="hover:text-[#0369A1] transition-colors">Patient Portal</Link></li>
              <li><Link to="/login" className="hover:text-[#0369A1] transition-colors">Administrator Access</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li><span className="cursor-not-allowed hover:text-gray-700 transition-colors">Privacy Policy</span></li>
              <li><span className="cursor-not-allowed hover:text-gray-700 transition-colors">Terms of Service</span></li>
              <li><span className="cursor-not-allowed hover:text-gray-700 transition-colors">HIPAA Compliance</span></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 font-medium">
            &copy; {currentYear} MedVault Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
              System Status: All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
