import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Clock, Activity, Star, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { doctorAPI, appointmentAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import logger from "../../utils/logger";
import Navbar from "../Navbar";
import DoctorSidebar from "./DoctorSidebar";
import Card from "../ui/Card";
import Avatar from "../ui/Avatar";
import { DashboardSkeleton } from "../ui/Skeleton";
import StatCard from "../shared/StatCard";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingRequests: 0,
    totalPatients: 0,
    rating: 0,
    revenue: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);

  useEffect(() => {
    if (user?.id) checkProfileAndFetchData();
  }, [user]);

  const checkProfileAndFetchData = async () => {
    try {
      setLoading(true);
      // Check if doctor has a profile
      try {
        await doctorAPI.getByUser(user.id);
        // Profile exists, fetch dashboard data
        await fetchDashboardData();
      } catch (error) {
        // If 404 or profile not found, redirect to complete profile
        if (error.response?.status === 404 || error.message?.includes('not found')) {
          logger.log('Doctor profile not found, redirecting to complete profile');
          navigate('/doctor/complete-profile');
          return;
        }
        throw error;
      }
    } catch (error) {
      logger.error('Error checking profile:', error);
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all appointments for this doctor
      const appointmentsRes = await appointmentAPI.getDoctorAppointments();
      const appointments = appointmentsRes.data?.data || [];

      // Today's date in YYYY-MM-DD
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAppointmentsList = appointments.filter(a => (a.appointmentDate || '').startsWith(todayStr));
      const pendingRequests = appointments.filter(a => a.status === 'PENDING').length;
      // Unique patients
      const patientIds = new Set(appointments.map(a => a.patientId));

      // Fetch doctor rating
      let rating = 0;
      try {
        const ratingRes = await doctorAPI.getDoctorAverageRating(user.id);
        rating = Number(ratingRes.data?.data?.averageRating) || 0;
      } catch (e) {
        rating = 0;
      }

      setStats({
        totalAppointments: appointments.length,
        todayAppointments: todayAppointmentsList.length,
        pendingRequests,
        totalPatients: patientIds.size,
        rating,
        revenue: 0 // Add revenue logic if available
      });

      setTodayAppointments(todayAppointmentsList.map(a => ({
        id: a.id,
        patientName: a.patientName,
        time: a.appointmentTime,
        type: a.reason,
        status: a.status
      })));
    } catch (error) {
      logger.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = React.useMemo(() => [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      iconColorClass: "text-blue-500",
      iconBgClass: "bg-blue-50 dark:bg-blue-900/20",
      trend: "Real-time"
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: Clock,
      iconColorClass: "text-amber-500",
      iconBgClass: "bg-amber-50 dark:bg-amber-900/20",
      trend: "Real-time"
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      iconColorClass: "text-purple-500",
      iconBgClass: "bg-purple-50 dark:bg-purple-900/20",
      trend: "Real-time"
    },
    {
      title: "Average Rating",
      value: stats.rating,
      icon: Star,
      iconColorClass: "text-yellow-500",
      iconBgClass: "bg-yellow-50 dark:bg-yellow-900/20",
      trend: "Real-time"
    },
  ], [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-neutral-900">
        <Navbar />
        <DoctorSidebar />
        <main className="pl-64 pt-24 p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-neutral-900">
      <Navbar />
      <DoctorSidebar />
      
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
                Welcome back, <span className="text-gradient-doctor">Dr. {user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                Here's your practice overview for today.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-2 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
              <div className="p-2 bg-doctor-50 dark:bg-doctor-900/20 rounded-xl">
                <Activity className="w-5 h-5 text-doctor-500" />
              </div>
              <div className="pr-2">
                <p className="text-xs text-neutral-500">Practice Health</p>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">Excellent</p>
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

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Today's Schedule */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Today's Schedule
                </h2>
                <button className="text-sm text-doctor-600 hover:text-doctor-700 font-medium">
                  View Calendar
                </button>
              </div>
              
              <Card variant="glass" className="min-h-[400px]">
                {todayAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-neutral-400">
                    <Calendar className="w-12 h-12 mb-4 opacity-20" />
                    <p>No appointments today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayAppointments.map((appointment, i) => (
                      <div
                        key={appointment.id}
                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                      >
                        <Avatar 
                          src={null} 
                          fallback={appointment.patientName?.[0] || "P"} 
                          role="patient"
                          size="md"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-900 dark:text-white">
                            {appointment.patientName}
                          </h4>
                          <p className="text-sm text-neutral-500">
                            {appointment.type}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                            <Clock size={12} />
                            {appointment.time}
                          </div>
                        </div>
                        <button className="px-3 py-1.5 text-xs font-medium bg-doctor-50 text-doctor-600 rounded-lg hover:bg-doctor-100 transition-colors">
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  Quick Actions
                </h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Create Slots", icon: Clock, color: "bg-blue-50 text-blue-600" },
                  { label: "Verify Docs", icon: CheckCircle, color: "bg-green-50 text-green-600" },
                  { label: "Patient List", icon: Users, color: "bg-purple-50 text-purple-600" },
                  { label: "Reports", icon: Activity, color: "bg-orange-50 text-orange-600" },
                ].map((action, i) => (
                  <Card 
                    key={i} 
                    variant="premium" 
                    hover 
                    className="flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon size={24} />
                    </div>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {action.label}
                    </span>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
