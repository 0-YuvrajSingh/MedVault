import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCog, FileCheck, ShieldAlert,
  BarChart3, Stethoscope, Calendar, Clock, FileText,
  Shield, Star, User, LogOut, X, ChevronRight,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { NavItem, Role } from '@/types';

// ─── Nav Config ───────────────────────────────────────────────────────────────

const NAV_CONFIG: Record<Role, { label: string; subtitle: string; accent: string; items: NavItem[] }> = {
  ADMIN: {
    label: 'Admin Console',
    subtitle: 'System Administration',
    accent: 'from-orange-600 to-orange-800',
    items: [
      { path: '/admin/dashboard',    label: 'Dashboard',            icon: LayoutDashboard },
      { path: '/admin/users',        label: 'Manage Users',         icon: UserCog },
      { path: '/admin/doctors',      label: 'Manage Doctors',       icon: Stethoscope },
      { path: '/admin/patients',     label: 'Manage Patients',      icon: Users },
      { path: '/admin/verifications',label: 'Doctor Verifications', icon: ShieldAlert },
      { path: '/admin/documents',    label: 'Document Verification',icon: FileCheck },
      { path: '/admin/reports',      label: 'System Reports',       icon: BarChart3 },
    ],
  },
  DOCTOR: {
    label: 'Doctor Portal',
    subtitle: 'Manage your practice',
    accent: 'from-violet-600 to-violet-800',
    items: [
      { path: '/doctor/dashboard',       label: 'Dashboard',        icon: LayoutDashboard },
      { path: '/doctor/appointments',    label: 'Appointments',     icon: Calendar },
      { path: '/doctor/booking-requests',label: 'Booking Requests', icon: Clock },
      { path: '/doctor/slots',           label: 'Manage Slots',     icon: Activity },
      { path: '/doctor/patients',        label: 'My Patients',      icon: Users },
      { path: '/doctor/medical-records', label: 'Medical Records',  icon: FileText },
      { path: '/doctor/reviews',         label: 'Reviews & Ratings',icon: Star },
      { path: '/doctor/documents',       label: 'Verification',     icon: Shield },
      { path: '/doctor/profile',         label: 'My Profile',       icon: User },
    ],
  },
  PATIENT: {
    label: 'Patient Portal',
    subtitle: 'Manage your health',
    accent: 'from-emerald-600 to-emerald-800',
    items: [
      { path: '/patient/dashboard',            label: 'Dashboard',            icon: LayoutDashboard },
      { path: '/patient/book-appointment',     label: 'Book Appointment',     icon: Calendar },
      { path: '/patient/my-appointments',      label: 'My Appointments',      icon: Clock },
      { path: '/patient/medical-records',      label: 'Medical Records',      icon: FileText },
      { path: '/patient/document-permissions', label: 'Document Permissions', icon: Shield },
      { path: '/patient/reviews',              label: 'Reviews & Ratings',    icon: Star },
      { path: '/patient/profile',              label: 'My Profile',           icon: User },
    ],
  },
};

// ─── Active style helpers ─────────────────────────────────────────────────────

const ACTIVE_STYLES: Record<Role, string> = {
  ADMIN:   'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50',
  DOCTOR:  'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50',
  PATIENT: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
};

const ACTIVE_ICON_STYLES: Record<Role, string> = {
  ADMIN:   'text-orange-600 dark:text-orange-500',
  DOCTOR:  'text-violet-600 dark:text-violet-500',
  PATIENT: 'text-emerald-600 dark:text-emerald-500',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user?.role) return null;

  const role = user.role.toUpperCase() as Role;
  const config = NAV_CONFIG[role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex-shrink-0">
        {/* Mobile close */}
        {onMobileClose && (
          <div className="flex justify-end mb-2 md:hidden">
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Role badge */}
        <div className={`bg-gradient-to-br ${config.accent} rounded-2xl p-4 mb-5 text-white shadow-lg`}>
          <h3 className="font-bold text-base leading-tight">{config.label}</h3>
          <p className="text-xs opacity-75 mt-0.5">{config.subtitle}</p>
        </div>

        {/* Nav items */}
        <nav className="space-y-0.5">
          {config.items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150 group
                  ${isActive
                    ? ACTIVE_STYLES[role]
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white border border-transparent'
                  }
                `}
              >
                <Icon
                  size={18}
                  className={isActive ? ACTIVE_ICON_STYLES[role] : 'opacity-60 group-hover:opacity-100 transition-opacity'}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto text-xs font-semibold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User info + logout */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.accent} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 dark:hover:border-red-800/50 transition-all duration-150"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-40 overflow-y-auto custom-scrollbar">
        {sidebarContent}
      </aside>

      {/* Mobile drawer — conditionally visible */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-50 md:hidden overflow-y-auto custom-scrollbar">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
