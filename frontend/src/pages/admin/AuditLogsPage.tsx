import React, { useState, useEffect } from 'react';
import { useAuditLog } from '../../hooks/useAdminQuery';
import type { AuditLogEntry } from '../../types';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const AuditLogsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recordId, setRecordId] = useState(searchParams.get('recordId') || '');
  const [searchedRecordId, setSearchedRecordId] = useState(searchParams.get('recordId') || '');

  const { data: logs = [], isLoading, error } = useAuditLog(searchedRecordId);

  useEffect(() => {
    const queryId = searchParams.get('recordId');
    if (queryId) {
      setRecordId(queryId);
      setSearchedRecordId(queryId);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (recordId) {
      setSearchParams({ recordId });
      setSearchedRecordId(recordId);
    }
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      header: 'Timestamp',
      accessor: (log) => <span className="text-xs font-mono text-slate-500">{new Date(log.performedAt).toLocaleString()}</span>,
    },
    {
      header: 'Action',
      accessor: (log) => <Badge variant="neutral">{log.action}</Badge>,
    },
    {
      header: 'Record',
      accessor: (log) => <span className="font-mono text-xs text-slate-400">{log.recordId.substring(0, 8)}...</span>,
    },
    {
      header: 'Performed By',
      accessor: (log) => <span className="font-medium text-slate-900">{log.performedByName}</span>,
    },
  ];

  const hasSearched = !!searchedRecordId;

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>View the immutable audit trail for any medical record</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Record ID</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-mono"
              placeholder="Enter medical record UUID"
              value={recordId}
              onChange={e => setRecordId(e.target.value)}
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" loading={isLoading}>Search</Button>
          </div>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-danger-50 border border-danger-100 rounded-lg text-sm text-danger-700">
            {(error as any)?.response?.data?.message || 'Failed to fetch audit log'}
          </div>
        )}
      </Card>

      {hasSearched && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Audit Trail ({logs.length} entries)</h2>
          </div>
          {logs.length === 0 && !isLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">No audit entries found for this record.</div>
          ) : (
            <DataTable columns={columns} data={logs} keyExtractor={(log) => log.id} loading={isLoading} />
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
