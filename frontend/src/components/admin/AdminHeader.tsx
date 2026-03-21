// @ts-nocheck
// src/components/admin/AdminHeader.jsx
import React, { useState, useEffect } from "react";
import { Bell, Search, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(3); // Mock count
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm px-6 py-4 transition-all">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search patients, doctors, records..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl outline-none text-slate-900 bg-white text-base focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-slate-600 hover:text-slate-900 bg-transparent border-none cursor-pointer transition">
            <Bell size={20} />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-medium text-slate-900">
                {user?.name || "Admin User"}
              </p>
              <p className="text-sm text-slate-600">Administrator</p>
            </div>
            <div className="size-10 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
