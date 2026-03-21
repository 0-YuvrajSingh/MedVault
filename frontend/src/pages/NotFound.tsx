import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertCircle, ArrowLeft, LayoutDashboard, Calendar, Clock, Users, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

interface RouteItem {
  path:  string;
  label: string;
  icon:  React.ComponentType<{ size?: number; className?: string }>;
}

const ROLE_ROUTES: Record<Role, RouteItem[]> = {
  PATIENT: [
    { path: '/patient/dashboard',        label: 'Dashboard',        icon: LayoutDashboard },
    { path: '/patient/book-appointment', label: 'Book Appointment', icon: Calendar        },
    { path: '/patient/my-appointments',  label: 'My Appointments',  icon: Clock           },
  ],
  DOCTOR: [
    { path: '/doctor/dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
    { path: '/doctor/appointments', label: 'Appointments',icon: Calendar        },
    { path: '/doctor/patients',     label: 'My Patients', icon: Users           },
  ],
  ADMIN: [
    { path: '/admin/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
    { path: '/admin/users',     label: 'Manage Users',  icon: Users           },
    { path: '/admin/reports',   label: 'System Reports',icon: FileText        },
  ],
};

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const suggestedRoutes: RouteItem[] = useMemo(
    () => (user?.role ? ROLE_ROUTES[user.role] ?? [] : []),
    [user?.role]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center">

        {/* 404 */}
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, type: 'spring', stiffness: 200 }} className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-[180px] md:text-[240px] font-black leading-none bg-gradient-to-br from-neutral-300 to-neutral-400 dark:from-neutral-600 dark:to-neutral-700 bg-clip-text text-transparent">
              404
            </h1>
            <motion.div animate={{ rotate: [0, 10, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3 mb-10">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Page Not Found</h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            The page you're looking for doesn't exist. It may have been moved or deleted.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline" size="lg" className="group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Go Back
            </Button>
            <Button onClick={() => navigate('/')} variant="primary" size="lg" className="group">
              <Home className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" /> Back to Home
            </Button>
          </div>

          {suggestedRoutes.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4 w-full max-w-sm">
              <p className="text-xs text-neutral-400 mb-3 font-medium uppercase tracking-wider">Suggested Pages</p>
              <div className="grid gap-2">
                {suggestedRoutes.map(r => (
                  <button key={r.path} onClick={() => navigate(r.path)}
                    className="flex items-center p-3.5 bg-white dark:bg-neutral-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-neutral-100 dark:border-neutral-700 group text-left">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                      <r.icon size={18} />
                    </div>
                    <span className="ml-3 text-sm font-medium text-neutral-700 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* BG blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <motion.div animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <motion.div animate={{ y: [0, 20, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
