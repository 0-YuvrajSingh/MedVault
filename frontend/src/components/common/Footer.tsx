import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FooterProps {
  variant?: 'public' | 'dashboard';
}

const Footer: React.FC<FooterProps> = ({ variant = 'public' }) => {
  const currentYear = new Date().getFullYear();

  if (variant === 'dashboard') {
    return (
      <footer className="mt-auto py-4 text-center text-xs text-slate-400 border-t border-slate-100">
        <p>&copy; {currentYear} MedVault. All rights reserved.</p>
      </footer>
    );
  }

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">MedVault</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              Secure healthcare records management for patients and providers.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-slate-500 hover:text-white transition-colors">Features</a></li>
              <li><a href="#security" className="text-sm text-slate-500 hover:text-white transition-colors">Security</a></li>
              <li><span className="text-sm text-slate-600 cursor-default">Pricing <span className="text-xs text-slate-600 ml-1">Soon</span></span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><span className="text-sm text-slate-600 cursor-default">Documentation</span></li>
              <li><a href="#faq" className="text-sm text-slate-500 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><span className="text-sm text-slate-600 cursor-default">Privacy Policy</span></li>
              <li><span className="text-sm text-slate-600 cursor-default">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-600">&copy; {currentYear} MedVault. All rights reserved.</p>
          <span className="text-xs text-slate-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            All Systems Operational
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
