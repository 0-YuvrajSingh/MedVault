import React, { useEffect, useState } from 'react';
import { doctorAPI } from '../../api/doctor';
import type { UserResponse } from '../../types';

const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorAPI.getPatients().then(r => setPatients(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Assigned Patients', value: patients.length, color: 'stat-card--teal', meta: 'Your patient list', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
    { label: 'Active Records', value: '—', color: 'stat-card--blue', meta: 'Recent medical files', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { label: 'Today', value: new Date().toLocaleDateString(), color: 'stat-card--amber', meta: 'Current date', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted">Loading dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Doctor Dashboard</h1>
        <p>Manage your patients and medical records</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
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

      {/* Assigned patients */}
      <div className="card">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Assigned Patients</h2>
        </div>
        {patients.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No patients assigned yet. Contact an admin to create assignments.</div>
        ) : (
          <div className="table-container border-0">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.fullName}</td>
                    <td className="text-text-secondary">{p.email}</td>
                    <td><span className="badge-success">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
