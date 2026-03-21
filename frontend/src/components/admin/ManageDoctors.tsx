import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Eye, Search, Trash2, UserCheck, XCircle } from 'lucide-react';
import { adminAPI, doctorAPI } from '@/api';
import { useAuth } from '@/context/AuthContext';
import logger from '@/utils/logger';
import { toast } from '@/utils/toast';
import { StatCardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import type { User } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DoctorProfile {
  id:              number;
  userId:          number;
  isVerified:      boolean;
  specialization?: string;
  licenseNumber?:  string;
  experienceYears?: number;
  consultationFee?: number;
  qualifications?: string;
}

interface MergedDoctor extends User {
  hasProfile:   boolean;
  profileId:    number | null;
  isVerified:   boolean;
  specialization?: string;
  licenseNumber?:  string;
  experienceYears?: number;
  consultationFee?: number;
  qualifications?: string;
}

type ActiveTab = 'all' | 'unverified';

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

export default function ManageDoctors() {
  const { user }  = useAuth();

  const [doctors,          setDoctors]         = useState<DoctorProfile[]>([]);
  const [unverified,       setUnverified]      = useState<DoctorProfile[]>([]);
  const [doctorUsers,      setDoctorUsers]     = useState<User[]>([]);
  const [loading,          setLoading]         = useState(true);
  const [search,           setSearch]          = useState('');
  const [activeTab,        setActiveTab]       = useState<ActiveTab>('all');
  const [selected,         setSelected]        = useState<MergedDoctor | null>(null);
  const [toDelete,         setToDelete]        = useState<MergedDoctor | null>(null);
  const [showDetails,      setShowDetails]     = useState(false);
  const [showDeleteModal,  setShowDeleteModal] = useState(false);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <XCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-neutral-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [allRes, unverRes, usersRes] = await Promise.all([
        doctorAPI.getAll(),
        adminAPI.getUnverifiedDoctors(),
        adminAPI.getUsers(),
      ]);
      if (allRes.data.success)    setDoctors(allRes.data.data ?? []);
      if (unverRes.data.success)  setUnverified(unverRes.data.data ?? []);
      if (usersRes.data.success)  setDoctorUsers((usersRes.data.data ?? []).filter((u: User) => u.role === 'DOCTOR'));
    } catch (err) {
      logger.error('Error fetching doctors/users:', err);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const merged: MergedDoctor[] = doctorUsers.map(u => {
    const profile = doctors.find(d => d.userId === u.id);
    return {
      ...u,
      hasProfile:      !!profile,
      profileId:       profile?.id ?? null,
      isVerified:      profile?.isVerified ?? false,
      specialization:  profile?.specialization,
      licenseNumber:   profile?.licenseNumber,
      experienceYears: profile?.experienceYears,
      consultationFee: profile?.consultationFee,
      qualifications:  profile?.qualifications,
    };
  });

  const filtered = merged
    .filter(d => activeTab === 'all' || !d.isVerified)
    .filter(d => {
      const q = search.toLowerCase();
      return !q || d.name.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q) || d.email.toLowerCase().includes(q);
    });

  const handleVerify = async (profileId: number | null) => {
    if (!profileId) { toast.error('Doctor profile ID not found'); return; }
    try {
      await adminAPI.verifyDoctor(profileId);
      toast.success('Doctor verified');
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to verify');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await doctorAPI.delete(toDelete.id);
      if (res.data.success) {
        toast.success('Doctor deleted');
        setShowDeleteModal(false);
        setToDelete(null);
        fetchAll();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to delete');
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Manage Doctors</h1>
      <StatCardSkeleton count={3} />
      <TableSkeleton rows={5} columns={6} />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
        <UserCheck className="text-blue-600" size={24} /> Manage Doctors
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {([
          { label: 'Total',    value: doctors.length,                            icon: UserCheck,     color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Verified', value: doctors.filter(d => d.isVerified).length,  icon: CheckCircle,   color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'Pending',  value: unverified.length,                         icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
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
        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          {(['all', 'unverified'] as ActiveTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab ? 'text-blue-600 border-blue-500' : 'text-neutral-500 border-transparent hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}>
              {tab === 'all' ? `All (${doctors.length})` : `Unverified (${unverified.length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input type="text" placeholder="Search by name, specialization, or email…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50">
              <tr>{['Doctor', 'Specialization', 'License', 'Profile', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.length > 0 ? filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-neutral-900 dark:text-white text-sm">{doc.name}</p>
                    <p className="text-xs text-neutral-400">{doc.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400">{doc.specialization ?? <span className="text-neutral-300">No profile</span>}</td>
                  <td className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400">{doc.licenseNumber ?? <span className="text-neutral-300">No profile</span>}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold ${doc.hasProfile ? 'text-green-600' : 'text-red-500'}`}>
                      {doc.hasProfile ? 'Profile' : 'Missing'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {doc.isVerified
                      ? <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircle size={13} /> Verified</span>
                      : doc.hasProfile
                        ? <span className="flex items-center gap-1 text-orange-600 text-xs font-semibold"><AlertTriangle size={13} /> Pending</span>
                        : <span className="flex items-center gap-1 text-neutral-400 text-xs font-semibold"><XCircle size={13} /> No Profile</span>
                    }
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelected(doc); setShowDetails(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="View"><Eye size={16} /></button>
                      {!doc.isVerified && doc.hasProfile && (
                        <button onClick={() => handleVerify(doc.profileId)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors" title="Verify"><CheckCircle size={16} /></button>
                      )}
                      <button onClick={() => { setToDelete(doc); setShowDeleteModal(true); }} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-5 py-12 text-center">
                  <UserCheck className="mx-auto text-neutral-300 mb-3" size={40} />
                  <p className="text-neutral-500 text-sm">No doctors found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selected && (
        <Modal title="Doctor Details" onClose={() => setShowDetails(false)}>
          <div className="p-5 space-y-3">
            {[
              { label: 'Name',            value: selected.name },
              { label: 'Email',           value: selected.email },
              { label: 'Specialization',  value: selected.specialization ?? 'N/A' },
              { label: 'License Number',  value: selected.licenseNumber ?? 'N/A' },
              { label: 'Experience',      value: selected.experienceYears ? `${selected.experienceYears} years` : 'N/A' },
              { label: 'Consultation Fee',value: selected.consultationFee ? `₹${selected.consultationFee}` : 'N/A' },
              { label: 'Status',          value: selected.isVerified ? 'Verified' : 'Pending Verification' },
            ].map(f => (
              <div key={f.label} className="grid grid-cols-2 gap-4">
                <p className="text-xs font-medium text-neutral-500">{f.label}</p>
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
        <Modal title="Delete Doctor" onClose={() => { setShowDeleteModal(false); setToDelete(null); }}>
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 className="text-red-600" size={24} /></div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-5">Delete <strong className="text-neutral-900 dark:text-white">{toDelete.name}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setToDelete(null); }} className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-300 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
