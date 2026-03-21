import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { medicalRecordAPI, accessRequestAPI } from '@/api';
import { toast } from '@/utils/toast';
import { formatDate } from '@/utils/dateUtils';
import { FileText, User, Calendar, Search } from 'lucide-react';
import { AppointmentListSkeleton } from '@/components/ui/Skeleton';
import type { MedicalRecord } from '@/types';

// Backend shape differs slightly from canonical MedicalRecord — extend locally
interface DoctorRecord extends MedicalRecord {
  patientName?: string;
  treatment?: string;
  followUpDate?: string;
  createdDate?: string; // legacy field
}

export default function DoctorMedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords]             = useState<DoctorRecord[]>([]);
  const [filtered, setFiltered]           = useState<DoctorRecord[]>([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');

  const fetchRecords = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await medicalRecordAPI.getByDoctor(user.id);
      if (res.data.success) {
        const list: DoctorRecord[] = (res.data.data ?? []).sort(
          (a: DoctorRecord, b: DoctorRecord) =>
            new Date(b.createdDate ?? b.createdAt).getTime() -
            new Date(a.createdDate ?? a.createdAt).getTime()
        );
        setRecords(list);
      }
    } catch {
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  useEffect(() => {
    if (!searchTerm) { setFiltered(records); return; }
    const q = searchTerm.toLowerCase();
    setFiltered(records.filter(r =>
      r.patientName?.toLowerCase().includes(q) ||
      r.diagnosis?.toLowerCase().includes(q) ||
      r.treatment?.toLowerCase().includes(q)
    ));
  }, [records, searchTerm]);

  const handleRequestAccess = async (patientId: number) => {
    try {
      const res = await accessRequestAPI.create({
        patientId,
        doctorId: user!.id,
        reason:   'Request access to medical records for consultation',
      });
      if (res.data.success) toast.success('Access request sent');
    } catch {
      toast.error('Failed to send access request');
    }
  };

  // Stats
  const uniquePatients = new Set(records.map(r => r.patientId)).size;
  const now            = new Date();
  const thisMonth      = records.filter(r => {
    const d = new Date(r.createdDate ?? r.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Medical Records</h1>
      <AppointmentListSkeleton />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Medical Records</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {([
          { label: 'Total Records',    value: records.length,  icon: FileText, color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Unique Patients',  value: uniquePatients,  icon: User,     color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'This Month',       value: thisMonth,        icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
        ] as const).map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <Icon className={`${s.color}`} size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
        <input
          type="text"
          placeholder="Search by patient, diagnosis, or treatment…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Records */}
      <div className="space-y-3">
        {filtered.map(rec => (
          <div key={rec.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center">
                  <User className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">{rec.patientName ?? `Patient #${rec.patientId}`}</p>
                  <p className="text-xs text-neutral-500">ID: {rec.patientId}</p>
                </div>
              </div>
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Calendar size={13} /> {formatDate(rec.createdDate ?? rec.createdAt)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {rec.diagnosis && (
                <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-3">
                  <p className="text-xs text-neutral-500 mb-0.5">Diagnosis</p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{rec.diagnosis}</p>
                </div>
              )}
              {rec.treatment && (
                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3">
                  <p className="text-xs text-neutral-500 mb-0.5">Treatment</p>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{rec.treatment}</p>
                </div>
              )}
            </div>

            {rec.prescription && (
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 mb-3 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="font-medium">Prescription: </span>{rec.prescription}
              </div>
            )}
            {rec.description && (
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">Notes: </span>{rec.description}
              </div>
            )}
            {rec.followUpDate && (
              <p className="mt-3 text-xs text-neutral-500 flex items-center gap-1">
                <Calendar size={13} className="text-blue-500" /> Follow-up: {formatDate(rec.followUpDate)}
              </p>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <FileText size={40} className="mx-auto mb-3 text-neutral-300" />
            <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No Records Found</p>
            <p className="text-sm text-neutral-500">
              {searchTerm ? 'Try adjusting your search' : 'Medical records will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
