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
    { label: 'Assigned Patients', value: patients.length, icon: '👥' },
    { label: 'Active Records', value: '—', icon: '📋' },
    { label: 'Today', value: new Date().toLocaleDateString(), icon: '📅' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted">Loading dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Doctor Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Manage your patients and medical records</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center gap-4">
              <div className="text-2xl">{s.icon}</div>
              <div>
                <p className="text-sm text-text-muted">{s.label}</p>
                <p className="text-xl font-bold text-text-primary">{s.value}</p>
              </div>
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
