import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home', section: 'home' },
  { to: '/#features', label: 'Features', section: 'features' },
  { to: '/#security', label: 'Security', section: 'security' },
  { to: '/#about', label: 'About', section: 'about' },
  { to: '/#contact', label: 'Contact', section: 'contact' },
];

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string, section?: string) => {
    if (to === '/' && section) {
      const el = document.getElementById(section);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">MedVault</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={(e) => handleNavClick(e, link.to, link.section)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                Register
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={(e) => {
                    handleNavClick(e, link.to, link.section);
                    setMobileOpen(false);
                  }}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 pb-2 border-t border-gray-100 mt-3 space-y-2">
                <Link
                  to="/login"
                  className="block w-full px-4 py-2.5 text-sm font-medium text-center text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full px-4 py-2.5 text-sm font-semibold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-400" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-lg flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">MedVault</span>
              </Link>
              <p className="text-sm leading-relaxed text-gray-500 mb-6 max-w-xs">
                Secure, simple, accessible healthcare records management for patients and providers.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-gray-500 hover:text-white transition-colors">Features</a></li>
                <li><a href="#security" className="text-sm text-gray-500 hover:text-white transition-colors">Security</a></li>
                <li><span className="text-sm text-gray-500 cursor-default">Pricing <span className="text-xs text-gray-600 ml-1">Coming Soon</span></span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><span className="text-sm text-gray-500 cursor-default">Documentation</span></li>
                <li><a href="#faq" className="text-sm text-gray-500 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#about" className="text-sm text-gray-500 hover:text-white transition-colors">About</a></li>
                <li><a href="#contact" className="text-sm text-gray-500 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><span className="text-sm text-gray-500 cursor-default">Privacy Policy</span></li>
                <li><span className="text-sm text-gray-500 cursor-default">Terms of Service</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} MedVault. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
