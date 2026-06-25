import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Logo from '../components/common/Logo';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Minimal navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-border">
        <div className="container-wide flex items-center justify-between h-16">
          <Logo />
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Home</Link>
            <Link to="/features" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:block">Features</Link>
            <Link to="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:block">About</Link>
            <Link to="/contact" className="text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:block">Contact</Link>
          </div>
        </div>
      </nav>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
