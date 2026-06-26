import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import type { UserResponse, AssignmentResponse } from '../../types';
import { Users, UserCog, User, ClipboardList } from 'lucide-react';

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
    { label: 'Total Users', value: users.length, color: 'stat-card--teal', meta: 'All registered accounts', icon: <Users /> },
    { label: 'Doctors', value: doctors.length, color: 'stat-card--blue', meta: 'Medical personnel', icon: <UserCog /> },
    { label: 'Patients', value: patients.length, color: 'stat-card--amber', meta: 'Registered patients', icon: <User /> },
    { label: 'Assignments', value: assignments.length, color: 'stat-card--rose', meta: 'Doctor-Patient links', icon: <ClipboardList /> },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted font-medium">Loading dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-card__icon">
              {s.icon}
            </div>
            <div className="stat-card__content">
              <span className="stat-card__label">{s.label}</span>
              <span className="stat-card__value">{s.value}</span>
              <span className="stat-card__meta">{s.meta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pending doctors alert */}
      {pendingDoctors.length > 0 && (
        <div className="alert alert--warning">
          <div className="font-bold">⚠️ {pendingDoctors.length} doctor(s) pending approval</div>
          <div className="space-y-1 font-medium">
            {pendingDoctors.slice(0, 5).map(d => (
              <p key={d.id}>{d.fullName} — {d.email}</p>
            ))}
          </div>
        </div>
      )}

      {/* Recent users */}
      <div className="card">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Recent Users</h2>
        </div>
        <div className="table-container border-0">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
            </thead>
            <tbody>
              {users.slice(0, 8).map(u => (
                <tr key={u.id}>
                  <td className="font-bold">{u.fullName}</td>
                  <td className="font-medium text-text-secondary">{u.email}</td>
                  <td><span className="badge-role">{u.role.replace('ROLE_', '')}</span></td>
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
