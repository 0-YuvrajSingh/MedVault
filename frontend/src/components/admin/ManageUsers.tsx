// @ts-nocheck
﻿
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Search } from "lucide-react";
import { adminAPI } from "../../api";
import { showToast } from "../../utils/toast";
import logger from "../../utils/logger";
import Navbar from '../Navbar';
import AdminSidebar from './AdminSidebar';
import { TableSkeleton } from '../ui/Skeleton';
import Card from '../ui/Card';

export default function ManageUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      const usersArr = response.data?.data || [];
      setUsers(Array.isArray(usersArr) ? usersArr : []);
    } catch (error) {
      logger.error("Failed to load users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminAPI.deleteUser(userId);
        showToast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        showToast.error("Failed to delete user");
      }
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <>
        <Navbar />
        <AdminSidebar />
        <div className="min-h-screen bg-surface dark:bg-neutral-900">
          <main className="pl-64 pt-24 p-8 transition-all duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Manage Users</h1>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-1">View and manage all platform users</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-2 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </motion.div>
              <Card variant="glass" className="min-h-[400px]">
                <TableSkeleton rows={5} columns={5} />
              </Card>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <AdminSidebar />
      <div className="min-h-screen bg-surface dark:bg-neutral-900">
        <main className="pl-64 pt-24 p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Manage Users</h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">View and manage all platform users</p>
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-2 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </motion.div>
            <Card variant="glass" className="p-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </motion.div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Created</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-900">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'DOCTOR' ? 'bg-teal-100 text-teal-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
