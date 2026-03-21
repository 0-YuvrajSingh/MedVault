import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { patientAPI, adminAPI } from '@/api';
import { toast } from '@/utils/toast';
import logger from '@/utils/logger';
import { Search, Users, Eye, Trash2, UserCheck, Calendar, User } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import type { Patient } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientRecord extends Patient {
  phoneNumber?: string;
  bloodGroup?:  string;
  gender?:      string;
  address?:     string;
  medicalHistory?: string;
  allergies?:   string;
  createdAt?:   string;
  isActive?:    boolean;
}

interface ModalProps { onClose: () => void; children: React.ReactNode; title: string }
function Modal({ onClose, children, title }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ManagePatients() {
  const [patients,       setPatients]      = useState<PatientRecord[]>([]);
  const [loading,        setLoading]       = useState(true);
  const [search,         setSearch]        = useState('');
  const [selected,       setSelected]      = useState<PatientRecord | null>(null);
  const [toDelete,       setToDelete]      = useState<PatientRecord | null>(null);
  const [showDetails,    setShowDetails]   = useState(false);
  const [showDeleteModal,setShowDelete]    = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await patientAPI.getAll();
      if (res.data.success) setPatients(res.data.data ?? []);
    } catch (err) {
      logger.error('Error fetching patients:', err);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await adminAPI.deleteUser(toDelete.userId);
      if (res.data.success) { toast.success('Patient deleted'); setShowDelete(false); setToDelete(null); fetchPatients(); }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to delete patient');
    }
  };

  const calcAge = (dob?: string) => dob
    ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null;

  const now = new Date();
  const thisMonth = patients.filter(p => {
    if (!p.createdAt) return false;
    const d = new Date(p.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.phoneNumber?.includes(q);
  });

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Manage Patients</h1>
      <StatCardSkeleton count={3} />
      <TableSkeleton rows={5} columns={6} />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
        <Users className="text-purple-600" size={24} /> Manage Patients
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {([
          { label: 'Total',    value: patients.length,                              icon: Users,     color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
          { label: 'Active',   value: patients.filter(p => p.isActive !== false).length, icon: UserCheck, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'New This Month', value: thisMonth,                              icon: Calendar,  color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
        ] as const).map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-neutral-500 mb-1">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2.5 rounded-xl ${s.bg}`}><Icon className={s.color} size={20} /></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input type="text" placeholder="Search by name, email, or phone…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50">
              <tr>{['Patient', 'Contact', 'Age', 'Blood Group', 'Registered', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.length > 0 ? filtered.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="text-purple-600" size={15} />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white text-sm">{p.name}</p>
                        <p className="text-xs text-neutral-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400">{p.phoneNumber ?? 'N/A'}</td>
                  <td className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400">{calcAge(p.dateOfBirth) ?? 'N/A'}</td>
                  <td className="px-5 py-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">{p.bloodGroup ?? 'N/A'}</td>
                  <td className="px-5 py-4 text-sm text-neutral-500">{p.createdAt ? formatDate(p.createdAt) : 'N/A'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelected(p); setShowDetails(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="View"><Eye size={16} /></button>
                      <button onClick={() => { setToDelete(p); setShowDelete(true); }} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-5 py-12 text-center">
                  <Users className="mx-auto text-neutral-300 mb-3" size={40} />
                  <p className="text-neutral-500 text-sm">No patients found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selected && (
        <Modal title="Patient Details" onClose={() => setShowDetails(false)}>
          <div className="p-5 grid grid-cols-2 gap-4">
            {[
              { label: 'Name',          value: selected.name },
              { label: 'Email',         value: selected.email },
              { label: 'Phone',         value: selected.phoneNumber ?? 'N/A' },
              { label: 'Date of Birth', value: selected.dateOfBirth ? formatDate(selected.dateOfBirth) : 'N/A' },
              { label: 'Blood Group',   value: selected.bloodGroup ?? 'N/A' },
              { label: 'Gender',        value: selected.gender ?? 'N/A' },
              { label: 'Address',       value: selected.address ?? 'N/A' },
              { label: 'Medical History', value: selected.medicalHistory ?? 'None' },
              { label: 'Allergies',     value: selected.allergies ?? 'None' },
              { label: 'Registered',    value: selected.createdAt ? formatDate(selected.createdAt) : 'N/A' },
            ].map(f => (
              <div key={f.label} className={f.label === 'Medical History' || f.label === 'Allergies' || f.label === 'Address' ? 'col-span-2' : ''}>
                <p className="text-xs font-medium text-neutral-500 mb-0.5">{f.label}</p>
                <p className="text-sm text-neutral-900 dark:text-white">{f.value}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end p-5 border-t border-neutral-200 dark:border-neutral-800">
            <button onClick={() => setShowDetails(false)} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-300 transition-colors">Close</button>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {showDeleteModal && toDelete && (
        <Modal title="Delete Patient" onClose={() => { setShowDelete(false); setToDelete(null); }}>
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 className="text-red-600" size={24} /></div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-5">Delete <strong className="text-neutral-900 dark:text-white">{toDelete.name}</strong>? All their records will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowDelete(false); setToDelete(null); }} className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-300 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
