import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { documentAPI } from '@/api';
import { toast } from '@/utils/toast';
import { formatDate } from '@/utils/dateUtils';
import { FileText, Calendar, CheckCircle, XCircle, Eye } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type DocFilter = 'ALL' | 'VERIFIED' | 'UNVERIFIED';

interface Doc {
  id:           number;
  patientId:    number;
  patientName?: string;
  fileName?:    string;
  documentType?: string;
  uploadDate?:  string;
  filePath?:    string;
  description?: string;
  verified:     boolean;
}

const DOC_TYPE_STYLES: Record<string, string> = {
  LAB_REPORT:          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  PRESCRIPTION:        'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400',
  MEDICAL_CERTIFICATE: 'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400',
  IMAGING:             'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  OTHER:               'bg-neutral-100 text-neutral-600',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DocumentVerification() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<DocFilter>('ALL');

  const fetchDocuments = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await documentAPI.getByDoctor(user.id);
      if (res.data.success) {
        const docs: Doc[] = (res.data.data ?? []).sort(
          (a: Doc, b: Doc) =>
            new Date(b.uploadDate ?? '').getTime() - new Date(a.uploadDate ?? '').getTime()
        );
        setDocuments(docs);
      }
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleVerify = async (id: number) => {
    if (!window.confirm('Verify this document?')) return;
    try {
      const res = await documentAPI.verify(id);
      if (res.data.success) { toast.success('Document verified'); fetchDocuments(); }
    } catch {
      toast.error('Failed to verify document');
    }
  };

  const filtered = documents.filter(d =>
    filter === 'ALL'        ? true :
    filter === 'VERIFIED'   ? d.verified :
                              !d.verified
  );

  const verifiedCount   = documents.filter(d => d.verified).length;
  const unverifiedCount = documents.length - verifiedCount;

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Document Verification</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {([
          { label: 'Total',    value: documents.length, icon: FileText,    color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Pending',  value: unverifiedCount,  icon: XCircle,     color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
          { label: 'Verified', value: verifiedCount,    icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/30' },
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
                  <Icon className={s.color} size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          {([
            { key: 'ALL',        label: `All (${documents.length})`,        active: 'text-blue-600 border-blue-600' },
            { key: 'UNVERIFIED', label: `Pending (${unverifiedCount})`,      active: 'text-yellow-600 border-yellow-600' },
            { key: 'VERIFIED',   label: `Verified (${verifiedCount})`,       active: 'text-green-600 border-green-600' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                filter === tab.key
                  ? tab.active
                  : 'text-neutral-500 border-transparent hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{doc.fileName ?? 'Document'}</p>
                    <p className="text-xs text-neutral-500">Patient: {doc.patientName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Type</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      DOC_TYPE_STYLES[doc.documentType ?? 'OTHER'] ?? DOC_TYPE_STYLES.OTHER
                    }`}>
                      {doc.documentType?.replace(/_/g, ' ') ?? 'OTHER'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Upload Date</p>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                      <Calendar size={13} /> {doc.uploadDate ? formatDate(doc.uploadDate) : '—'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Status</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      doc.verified
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {doc.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>

                {doc.description && (
                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 mb-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {doc.description}
                  </div>
                )}
                {doc.filePath && (
                  <p className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                    <Eye size={12} /> {doc.filePath}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                {doc.verified
                  ? <span className="flex items-center gap-1 text-green-600 text-sm font-semibold"><CheckCircle size={16} /> Verified</span>
                  : (
                    <button
                      onClick={() => handleVerify(doc.id)}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={15} /> Verify
                    </button>
                  )
                }
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <FileText size={40} className="mx-auto mb-3 text-neutral-300" />
            <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No Documents Found</p>
            <p className="text-sm text-neutral-500">
              {filter === 'UNVERIFIED' ? 'All documents have been verified'
               : filter === 'VERIFIED' ? 'No verified documents yet'
               : 'No documents available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
