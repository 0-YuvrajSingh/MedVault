import React, { useEffect, useState } from 'react';
import { patientAPI } from '../../api/patient';
import type { MedicalRecordResponse } from '../../types';
import { FileText, Activity, UserCircle } from 'lucide-react';

const PatientDashboard: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientAPI.getRecords().then(r => setRecords(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const latest = records[0];

  const stats = [
    { label: 'Medical Records', value: records.length, color: 'stat-card--teal', meta: 'Total records', icon: <FileText /> },
    { label: 'Latest Diagnosis', value: latest?.diagnosis || '—', color: 'stat-card--blue', meta: 'Most recent', icon: <Activity /> },
    { label: 'Primary Doctor', value: latest?.doctorName || '—', color: 'stat-card--amber', meta: 'Last seen', icon: <UserCircle /> },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted font-medium">Loading dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Patient Dashboard</h1>
        <p>Your health overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      <div className="card">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Recent Medical Records</h2>
        </div>
        <div className="table-container border-0">
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Doctor</th><th>Diagnosis</th></tr>
            </thead>
            <tbody>
              {records.slice(0, 5).map(r => (
                <tr key={r.id}>
                  <td className="font-medium whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="font-medium text-text-secondary">{r.doctorName}</td>
                  <td className="truncate max-w-xs">{r.diagnosis}</td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan={3} className="text-center text-text-muted py-8 font-medium">No medical records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
