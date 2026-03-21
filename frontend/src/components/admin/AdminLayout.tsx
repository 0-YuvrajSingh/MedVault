// @ts-nocheck
// src/components/admin/AdminLayout.jsx
import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
