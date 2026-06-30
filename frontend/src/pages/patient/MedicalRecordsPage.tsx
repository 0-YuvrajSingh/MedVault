import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { patientAPI } from '../../api/patient';
import type { MedicalRecord } from '../../types';
import { X, FileText } from 'lucide-react';
import { formatRelativeTime } from '../../utils/date';
import { DashboardSkeleton } from '../../components/common/Skeleton';

const MedicalRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    patientAPI.getRecords(page, 10).then(r => {
      setRecords(r.data.content);
      setTotalPages(r.data.totalPages);
    }).catch(console.error).finally(() => setLoading(false));
  }, [page]);

  // Group by month
  const grouped: Record<string, MedicalRecord[]> = {};
  records.forEach(r => {
    const d = new Date(r.createdAt);
    const key = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Medical Records</h1>
        <p>{records.length} total records</p>
      </div>

      {records.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-emerald-300" />
          </div>
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
                <div className="ml-1.5 border-l-2 border-slate-200 pl-6 space-y-4">
                  {items.map(r => (
                    <div key={r.id} className="card-elevated p-5 cursor-pointer hover:-translate-y-0.5 transition-all duration-200" onClick={() => setSelectedRecord(r)}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-text-primary">{r.diagnosis}</h3>
                        <span className="text-xs font-medium text-emerald-600">{formatRelativeTime(r.createdAt)}</span>
                      </div>
                      <p className="text-sm text-text-secondary"><strong>Rx:</strong> {r.prescription}</p>
                      {r.doctorName && <p className="text-xs text-text-muted mt-2">Dr. {r.doctorName}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-text-muted">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Record detail drawer */}
      {selectedRecord && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedRecord(null)} />
          <div className="relative w-full h-full max-w-md bg-white shadow-2xl animate-slide-in-right overflow-y-auto border-l border-border">
            <div className="sticky top-0 bg-white border-b border-border p-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Record Details</h2>
              <button onClick={() => setSelectedRecord(null)} className="p-1 text-text-muted hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Diagnosis</label>
                <p className="text-text-primary mt-1 font-semibold">{selectedRecord.diagnosis}</p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Prescription</label>
                <p className="text-text-primary mt-1 leading-relaxed bg-gray-50 p-3 rounded-lg border border-slate-200">{selectedRecord.prescription}</p>
              </div>
              {selectedRecord.notes && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Notes</label>
                  <p className="text-text-secondary mt-1 text-sm leading-relaxed">{selectedRecord.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-slate-200">
                  <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Doctor</label>
                  <p className="text-text-primary mt-1 font-medium">{selectedRecord.doctorName || '—'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-slate-200">
                  <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Created</label>
                  <p className="text-text-primary mt-1 text-sm font-medium">{new Date(selectedRecord.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-slate-200">
                <label className="text-xs font-medium uppercase tracking-wider text-text-muted mb-0">Audit Status</label>
                <span className="badge-success">Securely Logged</span>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-text-muted">Record ID</label>
                <p className="text-xs text-text-muted mt-1 font-mono bg-gray-50 p-2 rounded border border-slate-200 select-all">{selectedRecord.id}</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MedicalRecordsPage;
