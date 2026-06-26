import React, { useEffect, useState } from 'react';
import { patientAPI } from '../../api/patient';
import type { MedicalRecord } from '../../types';

const PatientDashboard: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientAPI.getRecords().then(r => setRecords(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const latest = records.length > 0 ? records[0] : null;

  const stats = [
    { label: 'Medical Records', value: records.length, color: 'stat-card--teal', meta: 'Total records', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { label: 'Latest Diagnosis', value: latest?.diagnosis || '—', color: 'stat-card--blue', meta: 'Most recent', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> },
    { label: 'Primary Doctor', value: latest?.doctorName || '—', color: 'stat-card--amber', meta: 'Last seen', icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted">Loading dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Patient Dashboard</h1>
        <p>Your healthcare overview</p>
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

      {/* Recent records */}
      <div className="card">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Recent Records</h2>
        </div>
        {records.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No medical records yet. Records will appear here once your doctor creates them.</div>
        ) : (
          <div className="p-5 space-y-4">
            {records.slice(0, 5).map(r => (
              <div key={r.id} className="status-line pl-4 py-3 border-l-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-text-primary">{r.diagnosis}</h3>
                  <span className="text-xs text-text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-text-secondary"><strong>Rx:</strong> {r.prescription}</p>
                {r.doctorName && <p className="text-xs text-text-muted mt-1">Dr. {r.doctorName}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
