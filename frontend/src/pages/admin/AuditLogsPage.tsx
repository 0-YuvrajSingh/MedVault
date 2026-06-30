import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import type { AuditLogEntry } from '../../types';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from '../../components/ui/DataTable';

const AuditLogsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recordId, setRecordId] = useState(searchParams.get('recordId') || '');
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const fetchLogs = async (id: string) => {
    if (!id) return;
    setError(''); setLoading(true); setSearched(false);
    try {
      const res = await adminAPI.getAuditLog(id);
      setLogs(res.data);
      setSearched(true);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to fetch audit log');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const queryId = searchParams.get('recordId');
    if (queryId) {
      setRecordId(queryId);
      fetchLogs(queryId);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (recordId) {
      setSearchParams({ recordId });
      fetchLogs(recordId);
    }
  };

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (log: AuditLogEntry) => <span className="text-slate-500 text-xs font-medium">{new Date(log.timestamp).toLocaleString()}</span>,
    },
    {
      key: 'action',
      label: 'Action',
      render: (log: AuditLogEntry) => <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-md uppercase tracking-wider">{log.action}</span>,
    },
    {
      key: 'recordId',
      label: 'Record',
      render: (log: AuditLogEntry) => <span className="font-mono text-xs text-slate-500">{log.recordId.substring(0, 8)}...</span>,
    },
    {
      key: 'performedBy',
      label: 'Performed By',
      render: (log: AuditLogEntry) => <span className="font-medium text-slate-900">{log.performedByName || log.performedBy}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">View the immutable audit trail for any medical record</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Record ID</label>
            <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none" placeholder="Enter medical record UUID" value={recordId} onChange={e => setRecordId(e.target.value)} required />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        {error && <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Audit Trail ({logs.length} entries)</h2>
          </div>
          {logs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">No audit entries found for this record.</div>
          ) : (
            <DataTable columns={columns} data={logs} loading={loading} />
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
