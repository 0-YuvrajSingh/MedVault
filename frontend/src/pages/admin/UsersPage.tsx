import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import type { UserResponse } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Link } from 'react-router-dom';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getUsers().then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'fullName', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (u: UserResponse) => (
        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md uppercase tracking-wider">
          {u.role.replace('ROLE_', '')}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      render: (u: UserResponse) => (
        u.active ? <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold">Active</span>
                 : <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-bold">Inactive</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u: UserResponse) => (
        u.role === 'ROLE_PATIENT' ? (
          <Link to={`/admin/patients/${u.id}/records`} className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline">
            View Records
          </Link>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Users</h1>
          <p className="text-sm text-slate-500 mt-1">{users.length} total active and inactive accounts</p>
        </div>
        <input
          type="text"
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <DataTable columns={columns} data={filtered} loading={loading} />
    </div>
  );
};

export default UsersPage;
