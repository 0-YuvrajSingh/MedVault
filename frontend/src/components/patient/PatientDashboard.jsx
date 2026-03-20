import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, FileText, Clock, Activity, Heart, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { patientAPI, appointmentAPI, medicalRecordAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../utils/toast";
import logger from "../../utils/logger";
import Navbar from "../Navbar";
import PatientSidebar from "./PatientSidebar";
import { DashboardSkeleton } from "../ui/Skeleton";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRecords: 0,
    pendingRecords: 0,
    recentActivity: 0,
    healthScore: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, recordsRes] = await Promise.all([
        appointmentAPI.getMyAppointments(),
        medicalRecordAPI.getPatientRecords()
      ]);

      if (appointmentsRes.data.success || Array.isArray(appointmentsRes.data)) {
        const appointments = appointmentsRes.data.data || appointmentsRes.data || [];
        setUpcomingAppointments(appointments.filter(apt => apt.status === "CONFIRMED").slice(0, 5));
        
        setStats(prev => ({
          ...prev,
          totalAppointments: appointments.length,
          upcomingAppointments: appointments.filter(apt => apt.status === "CONFIRMED").length,
          completedAppointments: appointments.filter(apt => apt.status === "COMPLETED").length,
          cancelledAppointments: appointments.filter(apt => apt.status === "CANCELLED").length
        }));
      }

      if (recordsRes.data.success || Array.isArray(recordsRes.data)) {
        const records = recordsRes.data.data || recordsRes.data || [];
        setRecentRecords(records.slice(0, 5));
        
        setStats(prev => ({
          ...prev,
          totalRecords: records.length,
          pendingRecords: records.filter(rec => rec.status === "PENDING").length,
          recentActivity: records.length + prev.totalAppointments,
          healthScore: 85
        }));
      }
    } catch (error) {
      logger.error('Dashboard data error:', error);
      // Silently fail - don't spam user with error notifications
    } finally {
      setLoading(false);
    }
  };

  const statCards = React.useMemo(() => [
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      iconColorClass: "text-blue-600",
      iconBgClass: "bg-blue-50",
      borderColorClass: "border-blue-500"
    },
    {
      title: "Upcoming",
      value: stats.upcomingAppointments,
      icon: Clock,
      iconColorClass: "text-amber-600",
      iconBgClass: "bg-amber-50",
      borderColorClass: "border-amber-500"
    },
    {
      title: "Completed",
      value: stats.completedAppointments,
      icon: CheckCircle,
      iconColorClass: "text-green-600",
      iconBgClass: "bg-green-50",
      borderColorClass: "border-green-500"
    },
    {
      title: "Cancelled",
      value: stats.cancelledAppointments,
      icon: AlertCircle,
      iconColorClass: "text-red-600",
      iconBgClass: "bg-red-50",
      borderColorClass: "border-red-500"
    },
    {
      title: "Medical Records",
      value: stats.totalRecords,
      icon: FileText,
      iconColorClass: "text-purple-600",
      iconBgClass: "bg-purple-50",
      borderColorClass: "border-purple-500"
    },
    {
      title: "Pending Records",
      value: stats.pendingRecords,
      icon: Activity,
      iconColorClass: "text-orange-600",
      iconBgClass: "bg-orange-50",
      borderColorClass: "border-orange-500"
    },
    {
      title: "Recent Activity",
      value: stats.recentActivity,
      icon: TrendingUp,
      iconColorClass: "text-cyan-600",
      iconBgClass: "bg-cyan-50",
      borderColorClass: "border-cyan-500"
    },
    {
      title: "Health Score",
      value: `${stats.healthScore}%`,
      icon: Heart,
      iconColorClass: "text-pink-600",
      iconBgClass: "bg-pink-50",
      borderColorClass: "border-pink-500"
    }
  ], [stats]);

  const getStatusColor = (status) => {
    const colors = {
      CONFIRMED: "text-green-600 bg-green-50",
      PENDING: "text-amber-600 bg-amber-50",
      COMPLETED: "text-blue-600 bg-blue-50",
      CANCELLED: "text-red-600 bg-red-50"
    };
    return colors[status] || "text-slate-600 bg-slate-50";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <PatientSidebar />
        <div className="min-h-screen bg-slate-50 p-6 pt-24 ml-64">
          <div className="max-w-7xl mx-auto">
            <DashboardSkeleton />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PatientSidebar />
      <div className="min-h-screen bg-slate-50 p-6 pt-24 ml-64">
        <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-600">Here's your health dashboard overview</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <StatCard
              key={index}
              {...stat}
              delay={index * 0.05}
            />
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Upcoming Appointments</h2>
            
            {upcomingAppointments.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id || appointment._id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                      {appointment.doctorName?.[0] || "D"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{appointment.doctorName}</h3>
                      <p className="text-sm text-slate-600">{appointment.specialization}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="size-3" />
                          {appointment.slotTime}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Medical Records */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Medical Records</h2>
            
            {recentRecords.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No recent records</p>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div
                    key={record.id || record._id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all"
                  >
                    <div className="size-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <FileText className="size-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{record.recordType}</h3>
                      <p className="text-sm text-slate-600">{record.description}</p>
                      <span className="text-xs text-slate-500">
                        {new Date(record.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
        </div>
      </div>
    </>
  );
}

const StatCard = ({ title, value, icon: Icon, iconColorClass, iconBgClass, borderColorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${borderColorClass} hover:shadow-md transition-shadow`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${iconBgClass}`}>
        <Icon className={`size-6 ${iconColorClass}`} />
      </div>
    </div>
  </motion.div>
);
