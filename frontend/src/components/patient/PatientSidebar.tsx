import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar, Clock, FileText, LayoutDashboard,
  Shield, Star, User, LogOut,
} from 'lucide-react';

const MENU_ITEMS = [
  { path: '/patient/dashboard',           icon: LayoutDashboard, label: 'Dashboard'            },
  { path: '/patient/book-appointment',    icon: Calendar,        label: 'Book Appointment'     },
  { path: '/patient/my-appointments',     icon: Clock,           label: 'My Appointments'      },
  { path: '/patient/medical-records',     icon: FileText,        label: 'Medical Records'      },
  { path: '/patient/reviews',             icon: Star,            label: 'Reviews & Ratings'    },
  { path: '/patient/document-permissions',icon: Shield,          label: 'Document Permissions' },
  { path: '/patient/profile',             icon: User,            label: 'My Profile'           },
];

const PatientSidebar = React.memo(() => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="w-64 min-h-screen fixed left-0 top-20 overflow-y-auto glass border-r border-white/20 z-40 pb-20">
      <div className="p-4">
        <div className="bg-gradient-to-br from-patient-500 to-patient-600 rounded-2xl p-4 mb-6 text-white shadow-lg">
          <h3 className="font-bold text-lg">Patient Portal</h3>
          <p className="text-xs opacity-80">Manage your health journey</p>
        </div>

        <nav className="space-y-1">
          {MENU_ITEMS.map(item => {
            const Icon     = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-patient-50 dark:bg-patient-900/20 text-patient-600 dark:text-patient-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                }`}>
                <Icon size={18} className={isActive ? 'text-patient-500' : 'opacity-70'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-4 pt-4 border-t border-neutral-200/50 dark:border-neutral-700/50">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200">
            <LogOut size={18} className="opacity-80" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default PatientSidebar;
