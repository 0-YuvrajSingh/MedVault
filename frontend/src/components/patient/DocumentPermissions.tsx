import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { accessRequestAPI, documentPermissionAPI } from '@/api';
import { Shield, CheckCircle, XCircle, Clock, Lock, AlertTriangle } from 'lucide-react';
import logger from '@/utils/logger';
import { toast } from '@/utils/toast';
import type { DocumentPermission } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey    = 'requests' | 'permissions';
type ReqStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface AccessRequest {
  id:          number;
  doctorName?: string;
  reason?:     string;
  status:      ReqStatus;
  createdAt:   string;
}

interface ActivePermission extends DocumentPermission {
  doctorName?: string;
  grantedAt:   string;
  expiresAt?:  string;
}

const STATUS_STYLES: Record<ReqStatus, string> = {
  PENDING:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  APPROVED: 'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400',
  REJECTED: 'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConfirmModal({
  open, onClose, onConfirm, title, body, confirmLabel = 'Confirm', danger = false,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; body: string; confirmLabel?: string; danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full shadow-xl p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-red-600" size={24} />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">{body}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-300 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DocumentPermissions() {
  const { user } = useAuth();

  const [requests,     setRequests]     = useState<AccessRequest[]>([]);
  const [permissions,  setPermissions]  = useState<ActivePermission[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState<TabKey>('requests');
  const [revokeTarget, setRevokeTarget] = useState<ActivePermission | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [reqRes, permRes] = await Promise.all([
        accessRequestAPI.getByPatient(),
        documentPermissionAPI.getByPatient(user.id),
      ]);
      setRequests(reqRes.data?.data ?? []);
      setPermissions(permRes.data ?? []);
    } catch (err) {
      logger.error('Error loading permissions data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id: number) => {
    try {
      await accessRequestAPI.approve(id);
      toast.success('Access request approved');
      fetchData();
    } catch { toast.error('Failed to approve request'); }
  };

  const handleReject = async (id: number) => {
    try {
      await accessRequestAPI.reject(id);
      toast.success('Access request rejected');
      fetchData();
    } catch { toast.error('Failed to reject request'); }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      await documentPermissionAPI.revoke(revokeTarget.id);
      toast.success('Permission revoked');
      setRevokeTarget(null);
      fetchData();
    } catch { toast.error('Failed to revoke permission'); }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  const cardCls = 'bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow';

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-0.5">Document Permissions</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage who has access to your medical records</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 dark:border-neutral-800">
        {([
          { key: 'requests'   as TabKey, label: 'Access Requests',    badge: pendingCount },
          { key: 'permissions'as TabKey, label: `Active Permissions (${permissions.length})`, badge: 0 },
        ]).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`relative px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === tab.key
                ? 'text-blue-600 border-blue-500'
                : 'text-neutral-500 border-transparent hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}>
            {tab.label}
            {tab.badge > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-red-600 text-white">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-24 bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />)
          ) : requests.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <Shield size={40} className="mx-auto mb-3 text-neutral-300" />
              <p className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1">No access requests</p>
              <p className="text-sm text-neutral-400">Doctors who need access to your records will appear here.</p>
            </div>
          ) : requests.map(req => (
            <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cardCls}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {req.doctorName ? `Dr. ${req.doctorName}` : 'Access Request'}
                    </p>
                    <p className="text-sm text-neutral-500 mt-0.5">{req.reason ?? 'Requesting access to your medical records'}</p>
                    <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                      <Clock size={12} /> {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[req.status]}`}>{req.status}</span>
                  {req.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(req.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button onClick={() => handleReject(req.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Permissions */}
      {activeTab === 'permissions' && (
        <div className="space-y-3">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-24 bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />)
          ) : permissions.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <Lock size={40} className="mx-auto mb-3 text-neutral-300" />
              <p className="font-semibold text-neutral-600 dark:text-neutral-400 mb-1">No active permissions</p>
              <p className="text-sm text-neutral-400">You haven't granted record access to any doctor yet.</p>
            </div>
          ) : permissions.map(perm => (
            <motion.div key={perm.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cardCls}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lock className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {perm.doctorName ? `Dr. ${perm.doctorName}` : 'Permitted Doctor'}
                    </p>
                    <p className="text-sm text-neutral-500 mt-0.5">Has access to your medical records</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-neutral-400">
                      <span>Granted: {new Date(perm.grantedAt).toLocaleDateString()}</span>
                      {perm.expiresAt && <span>Expires: {new Date(perm.expiresAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => setRevokeTarget(perm)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors flex-shrink-0">
                  Revoke
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Revoke confirm modal */}
      <ConfirmModal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Revoke Access Permission?"
        body={`${revokeTarget?.doctorName ? `Dr. ${revokeTarget.doctorName}` : 'This doctor'} will no longer be able to view your medical records.`}
        confirmLabel="Revoke Access"
        danger
      />
    </div>
  );
}
