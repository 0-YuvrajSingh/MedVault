import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import { LayoutDashboard, Users, UserCog, ClipboardList, Shield, FileText, LogOut, Menu, X } from 'lucide-react';

interface SidebarItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const adminItems: SidebarItem[] = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { to: '/admin/doctors', label: 'Doctors', icon: <UserCog className="w-5 h-5" /> },
  { to: '/admin/assignments', label: 'Assignments', icon: <ClipboardList className="w-5 h-5" /> },
  { to: '/admin/audit', label: 'Audit Logs', icon: <Shield className="w-5 h-5" /> },
];

const doctorItems: SidebarItem[] = [
  { to: '/doctor', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/doctor/patients', label: 'Patients', icon: <Users className="w-5 h-5" /> },
  { to: '/doctor/records', label: 'Records', icon: <FileText className="w-5 h-5" /> },
];

const patientItems: SidebarItem[] = [
  { to: '/patient', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/patient/records', label: 'Medical Records', icon: <FileText className="w-5 h-5" /> },
];

function getSidebarItems(role: string | null): SidebarItem[] {
  if (role === 'ROLE_ADMIN') return adminItems;
  if (role === 'ROLE_DOCTOR') return doctorItems;
  if (role === 'ROLE_PATIENT') return patientItems;
  return [];
}

const roleTokens = {
  ROLE_ADMIN:   { color: '#0369A1', tint: '#EFF6FF', text: '#0F4C81', label: 'Admin Portal' },
  ROLE_DOCTOR:  { color: '#0D9488', tint: '#CCFBF1', text: '#0F766E', label: 'Doctor Portal' },
  ROLE_PATIENT: { color: '#059669', tint: '#ECFDF5', text: '#047857', label: 'Patient Portal' },
};

const DashboardLayout: React.FC = () => {
  const { role, logout, fullName } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const items = getSidebarItems(role);
  
  const tokens = roleTokens[role as keyof typeof roleTokens] ?? roleTokens.ROLE_PATIENT;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-surface" style={{
      '--role-color': tokens.color,
      '--role-tint': tokens.tint,
      '--role-text': tokens.text,
    } as React.CSSProperties}>
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-border">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Logo />
        </div>
        <div className="h-1 w-full" style={{ backgroundColor: 'var(--role-color)' }} />
        <div className="flex-1 py-4 px-3">
          <div className="mb-4 px-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{tokens.label}</span>
          </div>
          <nav className="space-y-1">
            {items.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-3 border-t border-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-danger-500 hover:bg-danger-50 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white flex flex-col animate-slide-in-right">
            <div className="h-16 flex items-center justify-between px-6 border-b border-border">
              <Logo />
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {items.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link 
                    key={item.to} 
                    to={item.to} 
                    onClick={() => setSidebarOpen(false)}
                    className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                  >
                    {item.icon}{item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-border">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-danger-500 hover:bg-danger-50 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
          <button className="lg:hidden p-2 text-text-secondary hover:text-text-primary" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <span className="badge-role">
              {tokens.label}
            </span>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold avatar-accent shadow-sm border border-[var(--role-color)]">
              {fullName?.[0] ?? role?.[5] ?? 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
