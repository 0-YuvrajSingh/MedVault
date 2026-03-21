import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search } from 'lucide-react';
import { adminAPI } from '@/api';
import { toast } from '@/utils/toast';
import logger from '@/utils/logger';
import { TableSkeleton } from '@/components/ui/Skeleton';
import type { User, Role } from '@/types';

const ROLE_STYLES: Record<Role, string> = {
  ADMIN:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DOCTOR:  'bg-teal-100   text-teal-700   dark:bg-teal-900/30   dark:text-teal-400',
  PATIENT: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
};

export default function ManageUsers() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers();
      const list = res.data?.data ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      logger.error('Failed to load users:', err);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Manage Users</h1>
      <TableSkeleton rows={5} columns={5} />
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Manage Users</h1>
          <p className="text-sm text-neutral-500 mt-0.5">View and manage all platform users</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 rounded-2xl shadow-sm">
          <Users className="text-blue-500" size={18} />
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{users.length} total</span>
        </div>
      </motion.div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input type="text" placeholder="Search by name or email…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50">
              <tr>{['Name', 'Email', 'Role', 'Created', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-neutral-500">No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-neutral-900 dark:text-white">{u.name}</td>
                  <td className="px-5 py-4 text-sm text-neutral-500">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_STYLES[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-500">
                    {(u as any).createdAt ? new Date((u as any).createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleDelete(u.id)} className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
