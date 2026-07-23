import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePatientRecords } from '../../hooks/usePatientQuery';
import type { MedicalRecord } from '../../types';
import { X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatRelativeTime } from '../../utils/date';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

const MedicalRecordsPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const { data, isLoading, isError } = usePatientRecords(page);

  const records = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const grouped: Record<string, MedicalRecord[]> = {};
  records.forEach(r => {
    const d = new Date(r.createdAt);
    const key = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="space-y-6 pb-12">
        <div className="page-header">
          <h1>Medical Records</h1>
          <p>Unable to load records</p>
        </div>
        <Card className="p-6">
          <EmptyState
            icon={<FileText className="w-8 h-8 text-danger-500" />}
            title="Failed to load records"
            description="An error occurred while fetching your medical records. Please try again."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>Medical Records</h1>
        <p>{records.length} total records</p>
      </div>

      {records.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="No Records Yet"
            description="Your medical records will appear here once your doctor creates them."
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
                <h2 className="text-sm font-semibold text-slate-900">{month}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">{items.length}</span>
              </div>
              <div className="ml-3 border-l-2 border-slate-100 pl-5 space-y-3">
                {items.map(r => (
                  <Card key={r.id} hover className="p-4 cursor-pointer" onClick={() => setSelectedRecord(r)}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-900">{r.diagnosis}</h3>
                      <span className="text-xs text-slate-400">{formatRelativeTime(r.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600"><span className="font-medium">Rx:</span> {r.prescription}</p>
                    {r.doctorName && <p className="text-xs text-slate-400 mt-1">{r.doctorName}</p>}
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} icon={<ChevronLeft className="w-4 h-4" />}>
                Previous
              </Button>
              <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedRecord && createPortal(
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40" onClick={() => setSelectedRecord(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-white shadow-xl border-l border-slate-200 overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Record Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Diagnosis</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedRecord.diagnosis}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Prescription</p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedRecord.prescription}</p>
                </div>
                {selectedRecord.notes && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-slate-600">{selectedRecord.notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Doctor</p>
                    <p className="text-sm font-medium text-slate-900">{selectedRecord.doctorName || '—'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Created</p>
                    <p className="text-sm text-slate-900">{new Date(selectedRecord.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Audit Status</p>
                  <Badge variant="success" dot>Logged</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Record ID</p>
                  <p className="text-xs text-slate-400 font-mono bg-slate-50 p-2 rounded border border-slate-100 select-all">{selectedRecord.id}</p>
                </div>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicalRecordsPage;
