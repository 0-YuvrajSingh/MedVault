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
    { label: 'Medical Records', value: records.length, icon: '📋' },
    { label: 'Latest Diagnosis', value: latest?.diagnosis || '—', icon: '🩺' },
    { label: 'Doctor', value: latest?.doctorName || '—', icon: '👨‍⚕️' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted">Loading dashboard...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Patient Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Your healthcare overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center gap-4">
              <div className="text-2xl">{s.icon}</div>
              <div className="min-w-0">
                <p className="text-sm text-text-muted">{s.label}</p>
                <p className="text-lg font-bold text-text-primary truncate">{s.value}</p>
              </div>
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
              <div key={r.id} className="border-l-4 border-success-500 pl-4 py-3">
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
