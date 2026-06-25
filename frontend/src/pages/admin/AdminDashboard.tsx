import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import type { UserResponse, AssignmentResponse } from '../../types';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, assignRes] = await Promise.all([adminAPI.getUsers(), adminAPI.getAssignments()]);
        setUsers(usersRes.data);
        setAssignments(assignRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const doctors = users.filter(u => u.role === 'ROLE_DOCTOR');
  const patients = users.filter(u => u.role === 'ROLE_PATIENT');
  const pendingDoctors = doctors.filter(d => !d.active);

  const stats = [
    { label: 'Total Users', value: users.length, color: 'bg-primary-500' },
    { label: 'Doctors', value: doctors.length, color: 'bg-indigo-500' },
    { label: 'Patients', value: patients.length, color: 'bg-success-500' },
    { label: 'Assignments', value: assignments.length, color: 'bg-warning-500' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted">Loading dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">System overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{s.label}</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-lg font-bold">{s.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending doctors alert */}
      {pendingDoctors.length > 0 && (
        <div className="p-4 bg-warning-50 border border-warning-400 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-warning-600 font-semibold text-sm">⚠️ {pendingDoctors.length} doctor(s) pending approval</span>
          </div>
          <div className="mt-2 space-y-1">
            {pendingDoctors.slice(0, 5).map(d => (
              <p key={d.id} className="text-sm text-text-secondary">{d.fullName} — {d.email}</p>
            ))}
          </div>
        </div>
      )}

      {/* Recent users */}
      <div className="card">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Recent Users</h2>
        </div>
        <div className="table-container border-0">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
            </thead>
            <tbody>
              {users.slice(0, 8).map(u => (
                <tr key={u.id}>
                  <td className="font-medium">{u.fullName}</td>
                  <td>{u.email}</td>
                  <td><span className="badge-gray">{u.role.replace('ROLE_', '')}</span></td>
                  <td>{u.active ? <span className="badge-success">Active</span> : <span className="badge-danger">Inactive</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
