import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Users, Clock, Star,
  Activity, CheckCircle, ChevronRight,
  TrendingUp
} from 'lucide-react';
import { doctorAPI, appointmentAPI } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import logger from '@/utils/logger';
import type { Appointment } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  totalAppointments: number;
  todayAppointments: number;
  pendingRequests: number;
  totalPatients: number;
  rating: number;
}

interface StatConfig {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  suffix?: string;
}

interface TodayAppointment {
  id: number;
  patientName: string;
  time: string;
  type?: string;
  status: string;
}

const QUICK_ACTIONS = [
  { label: 'Create Slots',  icon: Clock,        color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600',    path: '/doctor/slots' },
  { label: 'Verify Docs',   icon: CheckCircle,  color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600', path: '/doctor/documents' },
  { label: 'My Patients',   icon: Users,        color: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600',path: '/doctor/patients' },
  { label: 'Analytics',     icon: TrendingUp,   color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600',path: '/doctor/appointments' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0, todayAppointments: 0,
    pendingRequests: 0, totalPatients: 0, rating: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);

  useEffect(() => {
    if (user?.id) checkProfileAndFetch();
  }, [user?.id]);

  const checkProfileAndFetch = async () => {
    try {
      setLoading(true);
      try {
        await doctorAPI.getByUser(user!.id);
        await fetchDashboardData();
      } catch (err: any) {
        if (err.response?.status === 404) {
          navigate('/doctor/complete-profile');
          return;
        }
        throw err;
      }
    } catch (err) {
      logger.error('Profile check error:', err);
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const apptRes = await appointmentAPI.getDoctorAppointments();
      const appointments: Appointment[] = apptRes.data?.data ?? [];

      const todayStr = new Date().toISOString().split('T')[0];
      const todayList = appointments.filter(a => (a.date ?? '').startsWith(todayStr));
      const patientIds = new Set(appointments.map(a => a.patientId));

      let rating = 0;
      try {
        const ratingRes = await doctorAPI.getDoctorAverageRating(user!.id);
        rating = Number(ratingRes.data?.data?.averageRating) || 0;
      } catch { /* optional */ }

      setStats({
        totalAppointments: appointments.length,
        todayAppointments: todayList.length,
        pendingRequests:   appointments.filter(a => a.status === 'PENDING').length,
        totalPatients:     patientIds.size,
        rating,
      });

      setTodayAppointments(todayList.map(a => ({
        id:          a.id,
        patientName: a.patientName,
        time:        a.time ?? '',
        type:        undefined,
        status:      a.status,
      })));
    } catch (err) {
      logger.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = useMemo<StatConfig[]>(() => [
    { title: "Today's Appointments", value: stats.todayAppointments, icon: Calendar,   color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { title: 'Pending Requests',     value: stats.pendingRequests,   icon: Clock,      color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { title: 'Total Patients',       value: stats.totalPatients,     icon: Users,      color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { title: 'Average Rating',       value: stats.rating.toFixed(1), icon: Star,       color: 'text-yellow-500',  bg: 'bg-yellow-50 dark:bg-yellow-950/30', suffix: '/ 5' },
  ], [stats]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Welcome back, Dr. {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Here's your practice overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-white dark:bg-neutral-900 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="p-1.5 bg-violet-50 dark:bg-violet-950/30 rounded-lg">
            <Activity className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Practice Health</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Excellent</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">{s.title}</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {s.value}
                    {s.suffix && <span className="text-sm font-normal text-neutral-400 ml-1">{s.suffix}</span>}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Today's Schedule</h2>
            <Link to="/doctor/appointments" className="text-xs text-violet-600 font-medium flex items-center gap-0.5 hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 min-h-[200px]">
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                <Calendar className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">No appointments today</p>
              </div>
            ) : todayAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {apt.patientName?.[0] ?? 'P'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{apt.patientName}</p>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {apt.time}
                  </div>
                </div>
                <button className="text-xs font-medium px-2.5 py-1 bg-violet-50 dark:bg-violet-950/30 text-violet-600 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
                  View
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group text-center"
                >
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">{action.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
