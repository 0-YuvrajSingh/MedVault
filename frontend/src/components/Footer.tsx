// @ts-nocheck
import React from 'react';
import { Activity, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-white border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-admin-500 to-admin-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading">MedVault</span>
            </div>
            <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
              The next-generation healthcare platform. Secure, efficient, and beautiful appointment scheduling for everyone.
            </p>
            <div className="flex gap-4 pt-2">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="text-neutral-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'About Us', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-neutral-400 hover:text-admin-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Security', 'Compliance'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-neutral-400 hover:text-admin-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © {currentYear} MedVault Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs text-neutral-500">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
