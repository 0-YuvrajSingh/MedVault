import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Logo />
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors">Home</Link>
            <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors">Sign in</Link>
          </div>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full flex justify-center">
          <Outlet />
        </div>
      </main>
      <footer className="py-6 text-center border-t border-slate-200 bg-white">
        <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} MedVault. Secure Healthcare Record Management.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
