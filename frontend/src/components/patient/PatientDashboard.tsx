import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar, FileText, Clock, Activity,
  Heart, TrendingUp, AlertCircle, CheckCircle,
  ChevronRight
} from 'lucide-react';
import { appointmentAPI, medicalRecordAPI } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import type { Appointment, MedicalRecord, AppointmentStatus } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRecords: number;
  pendingRecords: number;
  recentActivity: number;
  healthScore: number;
}

interface StatCardConfig {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  CONFIRMED:  'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400',
  PENDING:    'text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400',
  COMPLETED:  'text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400',
  CANCELLED:  'text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<StatCardConfig & { delay: number }> = ({
  title, value, icon: Icon, color, bg, border, delay
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className={`bg-white dark:bg-neutral-900 rounded-2xl p-5 border ${border} shadow-sm hover:shadow-md transition-shadow`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
      </div>
      <div className={`p-2.5 rounded-xl ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </motion.div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0, upcomingAppointments: 0,
    completedAppointments: 0, cancelledAppointments: 0,
    totalRecords: 0, pendingRecords: 0,
    recentActivity: 0, healthScore: 85,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [apptRes, recRes] = await Promise.all([
        appointmentAPI.getMyAppointments(),
        medicalRecordAPI.getPatientRecords(),
      ]);

      const appointments: Appointment[] = apptRes.data?.data ?? apptRes.data ?? [];
      const records: MedicalRecord[] = recRes.data?.data ?? recRes.data ?? [];

      setUpcomingAppointments(appointments.filter(a => a.status === 'CONFIRMED').slice(0, 5));
      setRecentRecords(records.slice(0, 5));
      setStats({
        totalAppointments:    appointments.length,
        upcomingAppointments: appointments.filter(a => a.status === 'CONFIRMED').length,
        completedAppointments:appointments.filter(a => a.status === 'COMPLETED').length,
        cancelledAppointments:appointments.filter(a => a.status === 'CANCELLED').length,
        totalRecords:  records.length,
        pendingRecords:0,
        recentActivity:records.length + appointments.length,
        healthScore:   85,
      });
    } catch { /* silent — no toast spam */ }
    finally { setLoading(false); }
  };

  const statCards = useMemo<StatCardConfig[]>(() => [
    { title: 'Total Appointments', value: stats.totalAppointments,    icon: Calendar,    color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/30',    border: 'border-neutral-200 dark:border-neutral-800' },
    { title: 'Upcoming',           value: stats.upcomingAppointments,  icon: Clock,       color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/30',   border: 'border-neutral-200 dark:border-neutral-800' },
    { title: 'Completed',          value: stats.completedAppointments, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30',border: 'border-neutral-200 dark:border-neutral-800' },
    { title: 'Cancelled',          value: stats.cancelledAppointments, icon: AlertCircle, color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-950/30',      border: 'border-neutral-200 dark:border-neutral-800' },
    { title: 'Medical Records',    value: stats.totalRecords,          icon: FileText,    color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-neutral-200 dark:border-neutral-800' },
    { title: 'Pending Records',    value: stats.pendingRecords,        icon: Activity,    color: 'text-orange-600',  bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-neutral-200 dark:border-neutral-800' },
    { title: 'Recent Activity',    value: stats.recentActivity,        icon: TrendingUp,  color: 'text-cyan-600',    bg: 'bg-cyan-50 dark:bg-cyan-950/30',    border: 'border-neutral-200 dark:border-neutral-800' },
    { title: 'Health Score',       value: `${stats.healthScore}%`,     icon: Heart,       color: 'text-pink-600',    bg: 'bg-pink-50 dark:bg-pink-950/30',    border: 'border-neutral-200 dark:border-neutral-800' },
  ], [stats]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Here's your health overview for today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={card.title} {...card} delay={i * 0.04} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Upcoming Appointments</h2>
            <Link to="/patient/my-appointments" className="text-xs text-emerald-600 font-medium flex items-center gap-0.5 hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                <Calendar className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">No upcoming appointments</p>
              </div>
            ) : upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {apt.doctorName?.[0] ?? 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{apt.doctorName}</p>
                  <p className="text-xs text-neutral-500">{new Date(apt.date).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[apt.status]}`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Medical Records */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="font-semibold text-neutral-900 dark:text-white">Recent Medical Records</h2>
            <Link to="/patient/medical-records" className="text-xs text-emerald-600 font-medium flex items-center gap-0.5 hover:underline">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recentRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                <FileText className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">No records found</p>
              </div>
            ) : recentRecords.map((rec) => (
              <div key={rec.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{rec.title}</p>
                  <p className="text-xs text-neutral-500 truncate">{rec.diagnosis ?? rec.description}</p>
                </div>
                <span className="text-xs text-neutral-400 flex-shrink-0">
                  {new Date(rec.recordDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDashboard;
