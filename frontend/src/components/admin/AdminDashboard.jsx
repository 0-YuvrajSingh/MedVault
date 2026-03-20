import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, UserPlus, FileCheck, Activity, TrendingUp, AlertTriangle, DollarSign, Server } from "lucide-react";
import { adminAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import logger from "../../utils/logger";
import AdminLayout from "./AdminLayout";
import Navbar from "../Navbar";
import AdminSidebar from "./AdminSidebar";
import Card from "../ui/Card";
import Avatar from "../ui/Avatar";
import { DashboardSkeleton } from "../ui/Skeleton";
import StatCard from "../shared/StatCard";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeDoctors: 0,
    pendingVerifications: 0,
    revenue: 0
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch stats/activity if user is ADMIN
    if (user?.role !== 'ADMIN') return;
    async function fetchStatsAndActivity() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getTodayActivity()
        ]);
        setStats({
          activeDoctors: statsRes.data?.activeDoctors || 0,
          pendingVerifications: statsRes.data?.pendingVerifications || 0,
          revenue: statsRes.data?.revenue || 0
        });
        setActivity(activityRes.data?.activity || []);
      } catch (error) {
        logger.error("Failed to fetch dashboard stats or activity", error);
        setStats({
          activeDoctors: 0,
          pendingVerifications: 0,
          revenue: 0
        });
        setActivity([]);
      } finally {
        setLoading(false);
      }
    }
    fetchStatsAndActivity();
  }, [user?.role]);

  const statCards = React.useMemo(() => [
    {
      title: "Active Doctors",
      value: stats.activeDoctors,
      icon: UserPlus,
      iconColorClass: "text-green-500",
      iconBgClass: "bg-green-50 dark:bg-green-900/20",
      trend: "+5% this week"
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications,
      icon: AlertTriangle,
      iconColorClass: "text-admin-500",
      iconBgClass: "bg-admin-50 dark:bg-admin-900/20",
      trend: "Action Needed"
    },
    {
      title: "Total Revenue",
      value: `$${stats.revenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      iconColorClass: "text-purple-500",
      iconBgClass: "bg-purple-50 dark:bg-purple-900/20",
      trend: "+8% this week"
    },
  ], [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-neutral-900">
        <Navbar />
        <AdminSidebar />
        <main className="pl-64 pt-24 p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-surface dark:bg-neutral-900 flex flex-col items-center justify-center">
        <Navbar />
        <AdminSidebar />
        <main className="pl-64 pt-24 p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-neutral-600 dark:text-neutral-300">You do not have permission to view this page.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-neutral-900">
      <Navbar />
      <AdminSidebar />
      
      <main className="pl-64 pt-24 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                System Overview
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                Welcome back, Administrator. System is running smoothly.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-2 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <Server className="w-5 h-5 text-green-500" />
              </div>
              <div className="pr-2">
                <p className="text-xs text-neutral-500">System Status</p>
                <p className="text-sm font-bold text-green-600">Operational</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <StatCard
                key={index}
                {...stat}
                variant="premium"
                delay={index * 0.1}
              />
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  System Activity
                </h2>
                <button className="text-sm text-admin-600 hover:text-admin-700 font-medium">
                  View Logs
                </button>
              </div>
              
              <Card variant="glass" className="min-h-[400px]">
                <div className="space-y-4">
                  {activity.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">No recent activity.</div>
                  ) : (
                    (
                      activity.map((item, i) => (
                        <div
                          key={item.id || i}
                          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                        >
                          <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <Activity size={18} className="text-neutral-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              {item.message || item.type || 'Activity'}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {item.user || item.actor || ''} • {item.timeAgo || item.timestamp || ''}
                            </p>
                          </div>
                          {item.category && (
                            <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg">
                              {item.category}
                            </span>
                          )}
                        </div>
                      ))
                    )
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Admin Actions
                </h2>
              </div>
              
              <div className="space-y-4">
                {/* Action handlers for each card */}
                <Card
                  variant="premium"
                  hover
                  className="flex items-center gap-4 p-4 cursor-pointer group"
                  onClick={() => navigate('/admin/verifications')}
                >
                  <div className="w-12 h-12 rounded-2xl bg-admin-50 text-admin-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileCheck size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-white">Verify Doctors</h4>
                    <p className="text-xs text-neutral-500">{stats.pendingVerifications} pending requests</p>
                  </div>
                </Card>
                <Card
                  variant="premium"
                  hover
                  className="flex items-center gap-4 p-4 cursor-pointer group"
                  onClick={() => navigate('/admin/settings')}
                >
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-white">System Settings</h4>
                    <p className="text-xs text-neutral-500">Configure platform</p>
                  </div>
                </Card>
                <Card
                  variant="premium"
                  hover
                  className="flex items-center gap-4 p-4 cursor-pointer group"
                  onClick={() => navigate('/admin/users')}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-white">User Management</h4>
                    <p className="text-xs text-neutral-500">Manage access</p>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
