import React, { useState } from 'react';
import { adminAPI } from '../../api/admin';
import type { AuditLogEntry } from '../../types';

const AuditLogsPage: React.FC = () => {
  const [recordId, setRecordId] = useState('');
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true); setSearched(false);
    try {
      const res = await adminAPI.getAuditLog(recordId);
      setLogs(res.data);
      setSearched(true);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Failed to fetch audit log');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Audit Logs</h1>
        <p className="text-sm text-text-muted mt-1">View the immutable audit trail for any medical record</p>
      </div>

      {/* Search */}
      <div className="card p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-primary mb-1.5">Record ID</label>
            <input type="text" className="input" placeholder="Enter medical record UUID" value={recordId} onChange={e => setRecordId(e.target.value)} required />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        {error && <div className="mt-3 p-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-md">{error}</div>}
      </div>

      {/* Results */}
      {searched && (
        <div className="card">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">Audit Trail ({logs.length} entries)</h2>
          </div>
          {logs.length === 0 ? (
            <div className="p-8 text-center text-text-muted">No audit entries found for this record.</div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead><tr><th>Timestamp</th><th>Action</th><th>Record</th><th>Performed By</th></tr></thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td className="text-text-muted text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                      <td><span className="badge-primary">{log.action}</span></td>
                      <td className="font-mono text-xs text-text-secondary">{log.recordId.substring(0, 8)}...</td>
                      <td>{log.performedByName || log.performedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
