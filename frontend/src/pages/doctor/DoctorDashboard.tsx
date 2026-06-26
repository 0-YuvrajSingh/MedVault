import React, { useEffect, useState } from 'react';
import { doctorAPI } from '../../api/doctor';
import type { UserResponse } from '../../types';
import { Users, FileText, Calendar } from 'lucide-react';

const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorAPI.getPatients().then(r => setPatients(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Assigned Patients', value: patients.length, color: 'stat-card--teal', meta: 'Your patient list', icon: <Users /> },
    { label: 'Active Records', value: '—', color: 'stat-card--blue', meta: 'Recent medical files', icon: <FileText /> },
    { label: 'Today', value: new Date().toLocaleDateString(), color: 'stat-card--amber', meta: 'Current date', icon: <Calendar /> },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted font-medium">Loading dashboard...</div>;

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
          <h2 className="text-lg font-bold text-text-primary">Assigned Patients</h2>
        </div>
        {patients.length === 0 ? (
          <div className="p-8 text-center text-text-muted font-medium">No patients assigned yet. Contact an admin to create assignments.</div>
        ) : (
          <div className="table-container border-0">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td className="font-bold">{p.fullName}</td>
                    <td className="text-text-secondary font-medium">{p.email}</td>
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
