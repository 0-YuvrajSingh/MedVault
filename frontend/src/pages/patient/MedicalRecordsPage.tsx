import React, { useEffect, useState } from 'react';
import { patientAPI } from '../../api/patient';
import type { MedicalRecord } from '../../types';
import { X } from 'lucide-react';

const MedicalRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    patientAPI.getRecords().then(r => setRecords(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Group by month
  const grouped: Record<string, MedicalRecord[]> = {};
  records.forEach(r => {
    const d = new Date(r.createdAt);
    const key = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  if (loading) return <div className="flex items-center justify-center h-64 text-text-muted">Loading records...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Medical Records</h1>
        <p>{records.length} total records</p>
      </div>

      {records.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No Records Yet</h3>
          <p className="text-sm text-text-muted">Your medical records will appear here once your doctor creates them.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline */}
          <div className="space-y-8">
            {Object.entries(grouped).map(([month, items]) => (
              <div key={month}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="status-dot" />
                  <h2 className="text-lg font-semibold text-text-primary">{month}</h2>
                  <span className="badge-gray">{items.length}</span>
                </div>
                <div className="ml-1.5 border-l-2 border-gray-200 pl-6 space-y-4">
                  {items.map(r => (
                    <div key={r.id} className="card-elevated p-5 cursor-pointer hover:-translate-y-0.5 transition-all duration-200" onClick={() => setSelectedRecord(r)}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-text-primary">{r.diagnosis}</h3>
                        <span className="text-xs text-text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-text-secondary"><strong>Rx:</strong> {r.prescription}</p>
                      {r.doctorName && <p className="text-xs text-text-muted mt-2">Dr. {r.doctorName}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record detail drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedRecord(null)} />
          <div className="relative w-full max-w-md bg-white shadow-md animate-slide-in-right overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border p-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Record Details</h2>
              <button onClick={() => setSelectedRecord(null)} className="p-1 text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Diagnosis</label>
                <p className="text-text-primary mt-1">{selectedRecord.diagnosis}</p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Prescription</label>
                <p className="text-text-primary mt-1">{selectedRecord.prescription}</p>
              </div>
              {selectedRecord.notes && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Notes</label>
                  <p className="text-text-secondary mt-1 text-sm">{selectedRecord.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Doctor</label>
                  <p className="text-text-primary mt-1">{selectedRecord.doctorName || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Created</label>
                  <p className="text-text-primary mt-1">{new Date(selectedRecord.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Audit Status</label>
                <span className="inline-block mt-1 badge-success">Logged</span>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Record ID</label>
                <p className="text-xs text-text-muted mt-1 font-mono">{selectedRecord.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsPage;
