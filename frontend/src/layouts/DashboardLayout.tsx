import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import Footer from '../components/common/Footer';
import { LayoutDashboard, Users, UserCog, ClipboardList, Shield, FileText, LogOut, Menu, X, Bell, ChevronDown, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const items = getSidebarItems(role);
  const tokens = roleTokens[role as keyof typeof roleTokens] ?? roleTokens.ROLE_PATIENT;

  // Handle clicking outside profile dropdown
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

  // Compute breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;
    return (
      <React.Fragment key={url}>
        {index > 0 && <span className="text-gray-400 font-medium">/</span>}
        {isLast ? (
          <span className="text-gray-900 font-bold">{label}</span>
        ) : (
          <Link to={url} className="text-gray-500 font-medium hover:text-[var(--role-color)] transition-colors">{label}</Link>
        )}
      </React.Fragment>
    );
  });

  return (
    <div className="min-h-screen flex bg-surface" style={{
      '--role-color': tokens.color,
      '--role-tint': tokens.tint,
      '--role-text': tokens.text,
    } as React.CSSProperties}>
      
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex lg:flex-col bg-white border-r border-border transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-16 flex items-center justify-center border-b border-border">
          {isCollapsed ? (
            <div className="w-10 h-10 bg-[var(--role-color)] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
              M
            </div>
          ) : (
            <div className="px-6 w-full flex items-center">
              <Logo />
            </div>
          )}
        </div>
        
        <div className="h-1 w-full" style={{ backgroundColor: 'var(--role-color)' }} />
        
        <div className="flex-1 py-4 flex flex-col overflow-y-auto">
          {!isCollapsed && (
            <div className="mb-4 px-6">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{tokens.label}</span>
            </div>
          )}
          
          <nav className="space-y-1 px-3">
            {items.map((item) => {
              const isActive = location.pathname === item.to || (location.pathname.startsWith(item.to) && item.to !== `/${role?.split('_')[1]?.toLowerCase()}`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-item ${isActive ? 'nav-item--active' : ''} ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={`${isActive ? 'text-[var(--role-color)]' : 'text-gray-500'}`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 shadow-sm z-10 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Mobile sidebar overlay (unchanged logic, just styled nav items) */}
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
                const isActive = location.pathname === item.to || (location.pathname.startsWith(item.to) && item.to !== `/${role?.split('_')[1]?.toLowerCase()}`);
                return (
                  <Link 
                    key={item.to} 
                    to={item.to} 
                    onClick={() => setSidebarOpen(false)}
                    className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                  >
                    <div className={`${isActive ? 'text-[var(--role-color)]' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
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
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-text-secondary hover:text-text-primary" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm">
              {breadcrumbs}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            <span className="hidden sm:inline-flex badge-role">
              {tokens.label}
            </span>

            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all focus:outline-none"
              >
                <span className="text-sm font-bold text-gray-700 hidden sm:block ml-1">
                  {fullName?.split(' ')[0]}
                </span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold avatar-accent shadow-sm border border-[var(--role-color)] bg-white">
                  {fullName?.[0] ?? role?.[5] ?? 'U'}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-50 mb-2">
                    <p className="text-sm font-bold text-gray-900 truncate">{fullName}</p>
                    <p className="text-xs font-medium text-gray-500 truncate">{role?.replace('ROLE_', '')}</p>
                  </div>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-not-allowed opacity-70">
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </button>
                  
                  <div className="h-px bg-gray-50 my-2"></div>
                  
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-danger-600 hover:bg-danger-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto flex flex-col relative bg-gray-50/30">
          <div className="flex-1 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
          <Footer variant="dashboard" />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
