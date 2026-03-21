// @ts-nocheck
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  FileCheck,
  ShieldAlert,
  BarChart3,
  Stethoscope,
  Settings
} from "lucide-react";

const AdminSidebar = React.memo(() => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/users", icon: UserCog, label: "Manage Users" },
    { path: "/admin/doctors", icon: Stethoscope, label: "Manage Doctors" },
    { path: "/admin/patients", icon: Users, label: "Manage Patients" },
    { path: "/admin/verifications", icon: ShieldAlert, label: "Doctor Verifications" },
    { path: "/admin/documents", icon: FileCheck, label: "Document Verification" },
    { path: "/admin/reports", icon: BarChart3, label: "System Reports" },
  ];

  return (
    <div className="w-64 min-h-screen fixed left-0 top-20 overflow-y-auto glass border-r border-white/20 z-40 pb-20">
      <div className="p-4">
        <div className="bg-gradient-to-br from-admin-600 to-black rounded-2xl p-4 mb-6 text-white shadow-lg border border-admin-500/20">
          <h3 className="font-bold text-lg">Admin Console</h3>
          <p className="text-xs opacity-80 text-admin-200">System Administration</p>
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
                    ? "bg-admin-50 dark:bg-admin-900/20 text-admin-700 dark:text-admin-400 shadow-sm border border-admin-200 dark:border-admin-800" 
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                  }
                `}
              >
                <Icon size={20} className={isActive ? "text-admin-600 dark:text-admin-500" : "opacity-70"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
});

export default AdminSidebar;
