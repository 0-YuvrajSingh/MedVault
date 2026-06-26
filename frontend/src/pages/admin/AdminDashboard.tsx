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
    { label: 'Total Users', value: users.length, color: 'stat-card--teal', meta: 'All registered accounts', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { label: 'Doctors', value: doctors.length, color: 'stat-card--blue', meta: 'Medical personnel', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { label: 'Patients', value: patients.length, color: 'stat-card--amber', meta: 'Registered patients', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { label: 'Assignments', value: assignments.length, color: 'stat-card--rose', meta: 'Doctor-Patient links', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted">Loading dashboard...</div>;

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
          <div className="font-semibold">⚠️ {pendingDoctors.length} doctor(s) pending approval</div>
          <div className="space-y-1">
            {pendingDoctors.slice(0, 5).map(d => (
              <p key={d.id}>{d.fullName} — {d.email}</p>
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
