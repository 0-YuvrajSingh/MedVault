import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, AlertTriangle, DollarSign,
  Activity, FileCheck, Users, Server,
  ChevronRight
} from 'lucide-react';
import { adminAPI } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import logger from '@/utils/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  activeDoctors: number;
  pendingVerifications: number;
  revenue: number;
}

interface ActivityItem {
  id?: number | string;
  message?: string;
  type?: string;
  user?: string;
  actor?: string;
  timeAgo?: string;
  timestamp?: string;
  category?: string;
}

interface AdminAction {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  path: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ADMIN_ACTIONS: AdminAction[] = [
  {
    label: 'Verify Doctors',
    description: 'Review pending verifications',
    icon: FileCheck,
    color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600',
    path: '/admin/verifications',
  },
  {
    label: 'User Management',
    description: 'Manage platform access',
    icon: Users,
    color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600',
    path: '/admin/users',
  },
  {
    label: 'System Reports',
    description: 'View analytics & reports',
    icon: Activity,
    color: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600',
    path: '/admin/reports',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ activeDoctors: 0, pendingVerifications: 0, revenue: 0 });
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;

    const fetch = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getTodayActivity(),
        ]);
        setStats({
          activeDoctors:        statsRes.data?.activeDoctors ?? 0,
          pendingVerifications: statsRes.data?.pendingVerifications ?? 0,
          revenue:              statsRes.data?.revenue ?? 0,
        });
        setActivity(activityRes.data?.activity ?? []);
      } catch (err) {
        logger.error('Admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user?.role]);

  const statCards = useMemo(() => [
    {
      title: 'Active Doctors',
      value: stats.activeDoctors,
      icon: UserPlus,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      trend: '+5% this week',
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      trend: 'Action needed',
      urgent: stats.pendingVerifications > 0,
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      trend: '+8% this week',
    },
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
            System Overview
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Welcome back, {user?.name}. Platform is running smoothly.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-white dark:bg-neutral-900 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">System Status</p>
            <p className="text-sm font-semibold text-emerald-600">Operational</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`bg-white dark:bg-neutral-900 rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow ${
                s.urgent
                  ? 'border-orange-300 dark:border-orange-800'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">{s.title}</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{s.value}</p>
                  <p className={`text-xs mt-1 ${s.urgent ? 'text-orange-600 font-medium' : 'text-neutral-400'}`}>
                    {s.trend}
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

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="font-semibold text-neutral-900 dark:text-white">System Activity</h2>
            <button className="text-xs text-orange-600 font-medium flex items-center gap-0.5 hover:underline">
              View Logs <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 min-h-[200px]">
            {activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                <Activity className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : activity.map((item, i) => (
              <div key={item.id ?? i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {item.message ?? item.type ?? 'System activity'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {item.user ?? item.actor ?? ''} {item.timeAgo ?? item.timestamp ?? ''}
                  </p>
                </div>
                {item.category && (
                  <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-lg flex-shrink-0">
                    {item.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">Admin Actions</h2>
          {ADMIN_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{action.label}</p>
                  <p className="text-xs text-neutral-500 truncate">
                    {action.label === 'Verify Doctors'
                      ? `${stats.pendingVerifications} pending`
                      : action.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 flex-shrink-0" />
              </button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
