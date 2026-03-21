import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { documentAPI } from '@/api';
import { toast } from '@/utils/toast';
import logger from '@/utils/logger';
import { FileText, CheckCircle, XCircle, AlertTriangle, Eye, Search } from 'lucide-react';
import { formatDateTime } from '@/utils/dateUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus   = 'PENDING' | 'VERIFIED' | 'REJECTED';
type FilterType  = 'all' | 'pending' | 'verified' | 'rejected';

interface AdminDoc {
  id:                 number;
  fileName?:          string;
  fileSize?:          string;
  filePath?:          string;
  documentType?:      string;
  patientName?:       string;
  uploadedAt?:        string;
  description?:       string;
  verificationStatus?: DocStatus;
}

const DOC_TYPE_STYLES: Record<string, string> = {
  MEDICAL_RECORD: 'bg-blue-100   text-blue-800',
  LAB_REPORT:     'bg-purple-100 text-purple-800',
  PRESCRIPTION:   'bg-green-100  text-green-800',
  XRAY:           'bg-orange-100 text-orange-800',
  OTHER:          'bg-neutral-100 text-neutral-600',
};

const STATUS_CONFIG: Record<DocStatus, { icon: typeof CheckCircle; cls: string; label: string }> = {
  VERIFIED: { icon: CheckCircle,   cls: 'bg-green-100  text-green-800',  label: 'Verified' },
  PENDING:  { icon: AlertTriangle, cls: 'bg-orange-100 text-orange-800', label: 'Pending'  },
  REJECTED: { icon: XCircle,       cls: 'bg-red-100    text-red-800',    label: 'Rejected' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DocStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <Icon size={13} /> {cfg.label}
    </span>
  );
}

interface ModalProps { onClose: () => void; children: React.ReactNode; title: string }
function Modal({ onClose, children, title }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-2xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDocumentVerification() {
  const { user } = useAuth();

  const [documents,          setDocuments]         = useState<AdminDoc[]>([]);
  const [loading,            setLoading]           = useState(true);
  const [searchTerm,         setSearchTerm]        = useState('');
  const [filterType,         setFilterType]        = useState<FilterType>('all');
  const [selectedDoc,        setSelectedDoc]       = useState<AdminDoc | null>(null);
  const [docToAction,        setDocToAction]       = useState<AdminDoc | null>(null);
  const [showDetailsModal,   setShowDetailsModal]  = useState(false);
  const [showVerifyModal,    setShowVerifyModal]   = useState(false);
  const [showRejectModal,    setShowRejectModal]   = useState(false);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <XCircle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-neutral-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await documentAPI.getUnverified();
      if (res.data.success) setDocuments(res.data.data ?? []);
    } catch (err) {
      logger.error('Error fetching documents:', err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleVerify = async () => {
    if (!docToAction) return;
    try {
      const res = await documentAPI.verify(docToAction.id);
      if (res.data.success) { toast.success('Document verified'); setShowVerifyModal(false); setDocToAction(null); fetchDocuments(); }
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed to verify'); }
  };

  const handleReject = async () => {
    if (!docToAction) return;
    try {
      const res = await documentAPI.delete(docToAction.id);
      if (res.data.success) { toast.success('Document rejected'); setShowRejectModal(false); setDocToAction(null); fetchDocuments(); }
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Failed to reject'); }
  };

  const filtered = documents.filter(doc => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      doc.fileName?.toLowerCase().includes(q) ||
      doc.documentType?.toLowerCase().includes(q) ||
      doc.patientName?.toLowerCase().includes(q);
    const matchFilter = filterType === 'all' || doc.verificationStatus === filterType.toUpperCase();
    return matchSearch && matchFilter;
  });

  const count = (s: string) => documents.filter(d => filterType === 'all' || d.verificationStatus === s.toUpperCase()).length;

  const statCards = [
    { label: 'Total',    value: documents.length,                                             icon: FileText,    color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Pending',  value: documents.filter(d => d.verificationStatus === 'PENDING').length,  icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
    { label: 'Verified', value: documents.filter(d => d.verificationStatus === 'VERIFIED').length, icon: CheckCircle,   color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Rejected', value: documents.filter(d => d.verificationStatus === 'REJECTED').length, icon: XCircle,       color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-950/30' },
  ] as const;

  if (loading) return (
    <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" /></div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <FileText className="text-orange-600" size={24} /> Document Verification
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">Review and verify pending documents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => {
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
        {/* Filter Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
          {(['all', 'pending', 'verified', 'rejected'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilterType(f)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 whitespace-nowrap ${
                filterType === f ? 'text-orange-600 border-orange-500' : 'text-neutral-500 border-transparent hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}>
              {f} ({documents.filter(d => f === 'all' || d.verificationStatus === f.toUpperCase()).length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input type="text" placeholder="Search by filename, type, or patient…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50">
              <tr>{['Document', 'Patient', 'Type', 'Uploaded', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filtered.length > 0 ? filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="text-blue-600 flex-shrink-0" size={18} />
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white text-sm">{doc.fileName}</p>
                        <p className="text-xs text-neutral-400">{doc.fileSize ?? 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-700 dark:text-neutral-300">{doc.patientName ?? 'Unknown'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${DOC_TYPE_STYLES[doc.documentType ?? 'OTHER'] ?? DOC_TYPE_STYLES.OTHER}`}>
                      {doc.documentType?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-500">{doc.uploadedAt ? formatDateTime(doc.uploadedAt) : 'N/A'}</td>
                  <td className="px-5 py-4"><StatusBadge status={(doc.verificationStatus ?? 'PENDING') as DocStatus} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelectedDoc(doc); setShowDetailsModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors" title="View"><Eye size={16} /></button>
                      {doc.verificationStatus === 'PENDING' && (
                        <>
                          <button onClick={() => { setDocToAction(doc); setShowVerifyModal(true); }} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors" title="Verify"><CheckCircle size={16} /></button>
                          <button onClick={() => { setDocToAction(doc); setShowRejectModal(true); }} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors" title="Reject"><XCircle size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-5 py-12 text-center">
                  <FileText className="mx-auto text-neutral-300 mb-3" size={40} />
                  <p className="text-neutral-500 text-sm">No documents found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedDoc && (
        <Modal title="Document Details" onClose={() => setShowDetailsModal(false)}>
          <div className="p-5 space-y-4">
            {[
              { label: 'File Name',    value: selectedDoc.fileName },
              { label: 'Type',         value: selectedDoc.documentType?.replace('_', ' ') },
              { label: 'Patient',      value: selectedDoc.patientName ?? 'Unknown' },
              { label: 'Uploaded',     value: selectedDoc.uploadedAt ? formatDateTime(selectedDoc.uploadedAt) : 'N/A' },
              { label: 'Description',  value: selectedDoc.description ?? 'No description' },
            ].map(f => (
              <div key={f.label}>
                <p className="text-xs font-medium text-neutral-500 mb-0.5">{f.label}</p>
                <p className="text-sm text-neutral-900 dark:text-white">{f.value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-1">Status</p>
              <StatusBadge status={(selectedDoc.verificationStatus ?? 'PENDING') as DocStatus} />
            </div>
          </div>
          <div className="flex justify-between p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
            <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-300 transition-colors">Close</button>
            {selectedDoc.verificationStatus === 'PENDING' && (
              <div className="flex gap-2">
                <button onClick={() => { setShowDetailsModal(false); setDocToAction(selectedDoc); setShowRejectModal(true); }} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Reject</button>
                <button onClick={() => { setShowDetailsModal(false); setDocToAction(selectedDoc); setShowVerifyModal(true); }} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">Verify</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Verify Modal */}
      {showVerifyModal && docToAction && (
        <Modal title="Verify Document" onClose={() => { setShowVerifyModal(false); setDocToAction(null); }}>
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle className="text-green-600" size={24} /></div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-5">Verify <strong className="text-neutral-900 dark:text-white">{docToAction.fileName}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowVerifyModal(false); setDocToAction(null); }} className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-300 transition-colors">Cancel</button>
              <button onClick={handleVerify} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">Verify</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && docToAction && (
        <Modal title="Reject Document" onClose={() => { setShowRejectModal(false); setDocToAction(null); }}>
          <div className="p-5 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><XCircle className="text-red-600" size={24} /></div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-5">Reject and delete <strong className="text-neutral-900 dark:text-white">{docToAction.fileName}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowRejectModal(false); setDocToAction(null); }} className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-300 transition-colors">Cancel</button>
              <button onClick={handleReject} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Reject</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
