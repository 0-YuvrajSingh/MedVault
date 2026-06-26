import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/security', label: 'Security' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
        <div className="container-wide flex items-center justify-between h-16">
          <Logo />
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.to
                    ? 'text-admin-500 bg-admin-50'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="btn-ghost btn-sm">Log in</Link>
            <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
          </div>
          <button className="md:hidden p-2 text-text-secondary" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="block px-3 py-2 text-sm rounded-md text-text-secondary hover:bg-gray-50" onClick={() => setMobileOpen(false)}>{link.label}</Link>
              ))}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Link to="/login" className="btn-secondary text-center" onClick={() => setMobileOpen(false)}>Log in</Link>
                <Link to="/register" className="btn-primary text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border">
        <div className="container-wide py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo />
              <p className="mt-3 text-sm text-text-muted">Secure healthcare record management built with modern technologies.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Product</h4>
              <div className="space-y-2">
                <Link to="/features" className="block text-sm text-text-muted hover:text-text-primary transition-colors">Features</Link>
                <Link to="/security" className="block text-sm text-text-muted hover:text-text-primary transition-colors">Security</Link>
                <Link to="/about" className="block text-sm text-text-muted hover:text-text-primary transition-colors">About</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Account</h4>
              <div className="space-y-2">
                <Link to="/login" className="block text-sm text-text-muted hover:text-text-primary transition-colors">Log in</Link>
                <Link to="/register" className="block text-sm text-text-muted hover:text-text-primary transition-colors">Register</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Connect</h4>
              <div className="space-y-2">
                <a href="https://github.com/YuvrajSingh/MedVault" target="_blank" rel="noopener noreferrer" className="block text-sm text-text-muted hover:text-text-primary transition-colors">GitHub</a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-text-muted hover:text-text-primary transition-colors">LinkedIn</a>
                <Link to="/contact" className="block text-sm text-text-muted hover:text-text-primary transition-colors">Contact</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-text-muted">
            © {new Date().getFullYear()} MedVault. Built by Yuvraj Singh.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
