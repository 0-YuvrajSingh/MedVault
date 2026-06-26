import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, Github, Code2, Server } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Overview' },
  { to: '/features', label: 'Features' },
  { to: '/security', label: 'Security' },
  { to: '/about', label: 'About Project' },
  { to: '/contact', label: 'Developer' },
];

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50" style={{
      '--role-color': '#0369A1',
      '--role-tint': '#EFF6FF',
      '--role-text': '#0F4C81',
    } as React.CSSProperties}>
      
      {/* Top Bar - Tech Stack Quick Links */}
      <div className="bg-[#0F4C81] text-white text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6 font-medium">
            <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> Built with React 18</span>
            <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5" /> Spring Boot 3 API</span>
          </div>
          <div className="flex items-center gap-4 text-blue-100 font-medium">
            <a href="https://github.com/YuvrajSingh/MedVault" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1"><Github className="w-3.5 h-3.5"/> GitHub Repository</a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          
          {/* Custom Clinical Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-[#0369A1] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#0F4C81] tracking-tight leading-none">MedVault</div>
              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-1">SaaS Platform</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-[15px] font-bold rounded-md transition-colors ${
                  location.pathname === link.to
                    ? 'text-[#0369A1] bg-[#EFF6FF]'
                    : 'text-gray-600 hover:text-[#0369A1] hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-gray-600 hover:text-[#0369A1] font-bold text-sm px-2">Access Portal</Link>
            <Link to="/register" className="flex items-center gap-2 px-5 py-2.5 bg-[#0369A1] hover:bg-[#02598B] text-white font-bold rounded-md shadow-sm transition-colors text-sm">
              Register Test Account
            </Link>
          </div>
          
          <button className="md:hidden p-2 text-gray-500" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white animate-fade-in shadow-md">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={`block px-3 py-2 text-sm font-bold rounded-md ${
                  location.pathname === link.to ? 'text-[#0369A1] bg-[#EFF6FF]' : 'text-gray-600 hover:bg-slate-50'
                }`} onClick={() => setMobileOpen(false)}>{link.label}</Link>
              ))}
              <div className="pt-4 pb-2 border-t border-gray-200 flex flex-col gap-3">
                <Link to="/login" className="btn-secondary text-center font-bold" onClick={() => setMobileOpen(false)}>Access Portal</Link>
                <Link to="/register" className="btn-primary text-center shadow-sm font-bold flex items-center justify-center gap-2" onClick={() => setMobileOpen(false)}>
                  Register Test Account
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
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#0F4C81]" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">MedVault</span>
              </div>
              <p className="text-sm font-medium pr-4 leading-relaxed opacity-90">
                A HIPAA-inspired, secure healthcare record management platform built to demonstrate production-grade engineering standards.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Architecture</h4>
              <div className="space-y-3">
                <Link to="/features" className="block text-sm font-medium hover:text-white transition-colors">Role-Based Access Control</Link>
                <Link to="/features" className="block text-sm font-medium hover:text-white transition-colors">Immutable Audit Logging</Link>
                <Link to="/security" className="block text-sm font-medium hover:text-white transition-colors">Stateless JWT Auth</Link>
                <Link to="/security" className="block text-sm font-medium hover:text-white transition-colors">IDOR Prevention</Link>
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
                <Link to="/about" className="block text-sm font-medium hover:text-white transition-colors">About the Project</Link>
                <a href="https://github.com/YuvrajSingh/MedVault" target="_blank" rel="noopener noreferrer" className="block text-sm font-medium hover:text-white transition-colors">GitHub Repository</a>
                <Link to="/contact" className="block text-sm font-medium hover:text-white transition-colors">Developer Contact</Link>
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
