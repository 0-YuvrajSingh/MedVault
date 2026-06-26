import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Minimal clinical navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          
          {/* Custom Clinical Logo matching Auth branding */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#0F4C81] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0F4C81] tracking-tight">MedVault</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-[#0369A1] transition-colors">Home</Link>
            <Link to="/features" className="text-sm font-semibold text-gray-500 hover:text-[#0369A1] transition-colors hidden sm:block">Features</Link>
            <Link to="/about" className="text-sm font-semibold text-gray-500 hover:text-[#0369A1] transition-colors hidden sm:block">About</Link>
            <Link to="/contact" className="text-sm font-semibold text-gray-500 hover:text-[#0369A1] transition-colors hidden sm:block">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex justify-center">
           <Outlet />
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="py-6 text-center border-t border-gray-200 bg-white">
          <p className="text-sm text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} MedVault. Secure Healthcare Record Management.
          </p>
      </footer>
    </div>
  );
};

export default AuthLayout;