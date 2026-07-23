import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import Footer from '../components/common/Footer';
import { LayoutDashboard, Users, UserCog, ClipboardList, Shield, FileText, LogOut, Menu, X, Bell, ChevronDown, Settings, Activity, HeartPulse, Clock, Search } from 'lucide-react';

interface SidebarItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const adminItems: SidebarItem[] = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { to: '/admin/approvals', label: 'Approvals', icon: <UserCog className="w-5 h-5" /> },
  { to: '/admin/assignments', label: 'Assignments', icon: <ClipboardList className="w-5 h-5" /> },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: <Shield className="w-5 h-5" /> },
  { to: '/admin/system-health', label: 'System Health', icon: <Activity className="w-5 h-5" /> },
  { to: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

const doctorItems: SidebarItem[] = [
  { to: '/doctor', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/doctor/patients', label: 'Patients', icon: <Users className="w-5 h-5" /> },
  { to: '/doctor/records', label: 'Records', icon: <FileText className="w-5 h-5" /> },
  { to: '/doctor/reviews', label: 'Reviews', icon: <ClipboardList className="w-5 h-5" /> },
  { to: '/doctor/timeline', label: 'Timeline', icon: <Clock className="w-5 h-5" /> },
  { to: '/doctor/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { to: '/doctor/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

const patientItems: SidebarItem[] = [
  { to: '/patient', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/patient/records', label: 'My Records', icon: <FileText className="w-5 h-5" /> },
  { to: '/patient/my-doctor', label: 'My Doctor', icon: <HeartPulse className="w-5 h-5" /> },
  { to: '/patient/timeline', label: 'Timeline', icon: <Clock className="w-5 h-5" /> },
  { to: '/patient/notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { to: '/patient/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

function getSidebarItems(role: string | null): SidebarItem[] {
  if (role === 'ROLE_ADMIN') return adminItems;
  if (role === 'ROLE_DOCTOR') return doctorItems;
  if (role === 'ROLE_PATIENT') return patientItems;
  return [];
}

const DashboardLayout: React.FC = () => {
  const { role, logout, fullName } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const items = getSidebarItems(role);
  const themeClass = role === 'ROLE_ADMIN' ? 'theme-admin' : role === 'ROLE_DOCTOR' ? 'theme-doctor' : 'theme-patient';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === location.pathname) return true;
    if (path !== '/' && location.pathname.startsWith(path) && path.split('/').length > 2) return true;
    return false;
  };

  return (
    <div className={`${themeClass} min-h-screen flex bg-slate-50`}>
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Logo />
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={active ? 'text-primary-600' : 'text-slate-400'}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white flex flex-col animate-slide-in-right">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
              <Logo />
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {items.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                      active
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className={active ? 'text-primary-600' : 'text-slate-400'}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {role?.replace('ROLE_', '')}
            </span>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                  {fullName?.[0] ?? 'U'}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                  {fullName?.split(' ')[0]}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 animate-scale-in origin-top-right z-50">
                  <div className="px-4 py-3 border-b border-slate-100 mb-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{fullName}</p>
                    <p className="text-xs text-slate-500">{role?.replace('ROLE_', '')}</p>
                  </div>
                  <button
                    onClick={() => { navigate(
                      role === 'ROLE_ADMIN' ? '/admin/settings' :
                      role === 'ROLE_DOCTOR' ? '/doctor/settings' :
                      '/patient/settings'
                    ); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 p-4 lg:p-6 overflow-auto"
        >
          <div className="max-w-7xl mx-auto page-transition">
            <Outlet />
          </div>
        </motion.main>
        <Footer variant="dashboard" />
      </div>
    </div>
  );
};

export default DashboardLayout;
