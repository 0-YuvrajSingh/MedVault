import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, Github, Code2, Server } from 'lucide-react';
import Logo from '../components/common/Logo';

const navLinks: { to: string; label: string }[] = [];

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" style={{
      '--role-color': '#0369A1',
      '--role-tint': '#EFF6FF',
      '--role-text': '#0F4C81',
    } as React.CSSProperties}>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-black border-2 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">

          <Logo />

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-[15px] font-bold rounded-md transition-colors ${location.pathname === link.to
                  ? 'text-[#0369A1] bg-[#EFF6FF]'
                  : 'text-gray-600 hover:text-[#0369A1] hover:bg-slate-50'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-gray-600 hover:text-[#0369A1] font-bold text-sm px-2">Login</Link>
            <Link to="/register" className="flex items-center gap-2 px-5 py-2.5 bg-[#0369A1] hover:bg-[#02598B] text-white font-bold rounded-md shadow-sm transition-colors text-sm">
              Register
            </Link>
          </div>

          <button className="md:hidden p-2 text-gray-500" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-black border-2 bg-white animate-fade-in shadow-md">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={`block px-3 py-2 text-sm font-bold rounded-md ${location.pathname === link.to ? 'text-[#0369A1] bg-[#EFF6FF]' : 'text-gray-600 hover:bg-slate-50'
                  }`} onClick={() => setMobileOpen(false)}>{link.label}</Link>
              ))}
              <div className="pt-4 pb-2 border-t border-black border-2 flex flex-col gap-3">
                <Link to="/login" className="btn-secondary text-center font-bold" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary text-center shadow-sm font-bold flex items-center justify-center gap-2" onClick={() => setMobileOpen(false)}>
                  Register
                </Link>
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
      <footer className="bg-[#0F4C81] text-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <Logo variant="dark" className="mb-6 scale-110 origin-left" />
              <p className="text-sm font-medium pr-4 leading-relaxed opacity-90">
                A HIPAA-inspired, secure healthcare record management platform built to demonstrate production-grade engineering standards.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Architecture</h4>
              <div className="space-y-3">
                <span className="block text-sm font-medium opacity-80">Role-Based Access Control</span>
                <span className="block text-sm font-medium opacity-80">Immutable Audit Logging</span>
                <span className="block text-sm font-medium opacity-80">Stateless JWT Auth</span>
                <span className="block text-sm font-medium opacity-80">IDOR Prevention</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Tech Stack</h4>
              <div className="space-y-3">
                <span className="block text-sm font-medium opacity-80">Spring Boot 3 REST API</span>
                <span className="block text-sm font-medium opacity-80">Spring Security & JPA</span>
                <span className="block text-sm font-medium opacity-80">PostgreSQL + Flyway</span>
                <span className="block text-sm font-medium opacity-80">React 18 + Vite</span>
                <span className="block text-sm font-medium opacity-80">Docker Compose</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Project Links</h4>
              <div className="space-y-3">
                <a href="https://github.com/0-YuvrajSingh/MedVault" target="_blank" rel="noopener noreferrer" className="block text-sm font-medium hover:text-white transition-colors">GitHub Repository</a>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-blue-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium opacity-80">
              © {new Date().getFullYear()} MedVault Software Portfolio Project.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
