import {
    Calendar,
    Clock,
    FileText,
    LayoutDashboard,
    ShieldCheck,
    Star,
    User,
    Users
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DoctorSidebar = React.memo(() => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/doctor/appointments", icon: Calendar, label: "Appointments" },
    { path: "/doctor/booking-requests", icon: Clock, label: "Booking Requests" },
    { path: "/doctor/slots", icon: Clock, label: "Manage Slots" },
    { path: "/doctor/patients", icon: Users, label: "My Patients" },
    { path: "/doctor/medical-records", icon: FileText, label: "Medical Records" },
    { path: "/doctor/reviews", icon: Star, label: "Reviews & Ratings" },
    { path: "/doctor/documents", icon: ShieldCheck, label: "Verification" },
    { path: "/doctor/profile", icon: User, label: "My Profile" },
  ];

  return (
    <div className="w-64 min-h-screen fixed left-0 top-20 overflow-y-auto glass border-r border-white/20 z-40 pb-20">
      <div className="p-4">
        <div className="bg-gradient-to-br from-doctor-500 to-doctor-600 rounded-2xl p-4 mb-6 text-white shadow-lg">
          <h3 className="font-bold text-lg">Doctor Portal</h3>
          <p className="text-xs opacity-80">Manage your practice</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "bg-doctor-50 dark:bg-doctor-900/20 text-doctor-600 dark:text-doctor-400 shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                  }
                `}
              >
                <Icon size={20} className={isActive ? "text-doctor-500" : "opacity-70"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
});

export default DoctorSidebar;
