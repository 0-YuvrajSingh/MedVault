import React, { useState, useEffect } from 'react';
import { useAuditLog, usePlatformAuditLogs } from '../../hooks/useAdminQuery';
import type { AuditLogEntry, PlatformAuditLog } from '../../types';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const AuditLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'platform' | 'record'>('platform');
  const [platformPage, setPlatformPage] = useState(0);

  // Platform audit logs
  const { data: platformData, isLoading: platformLoading } = usePlatformAuditLogs(platformPage, 15);
  const platformLogs = platformData?.content || [];

  // Medical record audit search
  const [searchParams, setSearchParams] = useSearchParams();
  const [recordId, setRecordId] = useState(searchParams.get('recordId') || '');
  const [searchedRecordId, setSearchedRecordId] = useState(searchParams.get('recordId') || '');
  const { data: recordLogs = [], isLoading: recordLoading, error: recordError } = useAuditLog(searchedRecordId);

  useEffect(() => {
    const queryId = searchParams.get('recordId');
    if (queryId) {
      setRecordId(queryId);
      setSearchedRecordId(queryId);
      setActiveTab('record');
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (recordId) {
      setSearchParams({ recordId });
      setSearchedRecordId(recordId);
    }
  };

  const platformColumns: Column<PlatformAuditLog>[] = [
    {
      header: 'Timestamp',
      accessor: (log) => (
        <span className="text-xs font-mono text-slate-500">
          {new Date(log.performedAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: (log) => {
        let variant: 'neutral' | 'success' | 'warning' | 'danger' = 'neutral';
        if (log.action.includes('APPROVED') || log.action.includes('ASSIGNED')) variant = 'success';
        else if (log.action.includes('DEACTIVATED') || log.action.includes('REJECTED')) variant = 'danger';
        else if (log.action.includes('REASSIGNED') || log.action.includes('UNASSIGNED')) variant = 'warning';
        return <Badge variant={variant}>{log.action}</Badge>;
      },
    },
    {
      header: 'Actor',
      accessor: (log) => <span className="font-medium text-slate-900">{log.actorName}</span>,
    },
    {
      header: 'Target Entity',
      accessor: (log) => (
        <span className="text-xs text-slate-600">
          {log.entityType ? `${log.entityType}` : '-'}
        </span>
      ),
    },
    {
      header: 'Details',
      accessor: (log) => (
        <span className="text-xs text-slate-600 truncate max-w-md block" title={log.detail || ''}>
          {log.detail || '-'}
        </span>
      ),
    },
  ];

  const recordColumns: Column<AuditLogEntry>[] = [
    {
      header: 'Timestamp',
      accessor: (log) => (
        <span className="text-xs font-mono text-slate-500">
          {new Date(log.performedAt).toLocaleString()}
        </span>
      ),
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
    {
      header: 'Snapshot',
      accessor: (log) => <span className="text-xs text-slate-500">{log.detailSnapshot || '-'}</span>,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>Comprehensive immutable audit trails for system operations and clinical records</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'platform'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('platform')}
        >
          Platform Audit Trail
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'record'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('record')}
        >
          Medical Record Lookup
        </button>
      </div>

      {activeTab === 'platform' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              System Events ({platformData?.totalElements ?? 0})
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={platformPage === 0 || platformLoading}
                onClick={() => setPlatformPage(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-slate-500">
                Page {platformPage + 1} of {Math.max(1, platformData?.totalPages || 1)}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={!platformData || platformData.last || platformLoading}
                onClick={() => setPlatformPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
          <DataTable
            columns={platformColumns}
            data={platformLogs}
            keyExtractor={(log) => log.id}
            loading={platformLoading}
            emptyMessage="No platform audit records recorded yet."
          />
        </div>
      )}

      {activeTab === 'record' && (
        <div className="space-y-6">
          <Card className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Medical Record ID</label>
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
                <Button type="submit" loading={recordLoading}>Search</Button>
              </div>
            </form>
            {recordError && (
              <div className="mt-4 p-3 bg-danger-50 border border-danger-100 rounded-lg text-sm text-danger-700">
                {(recordError as any)?.response?.data?.message || 'Failed to fetch audit log'}
              </div>
            )}
          </Card>

          {searchedRecordId && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Record Audit Trail ({recordLogs.length} entries)
                </h2>
              </div>
              <DataTable
                columns={recordColumns}
                data={recordLogs}
                keyExtractor={(log) => log.id}
                loading={recordLoading}
                emptyMessage="No audit entries found for this record."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
