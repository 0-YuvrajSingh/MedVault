import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePatientRecords } from '../../hooks/useAdminQuery';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, FileText, Calendar, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { formatRelativeTime } from '../../utils/date';

const AdminPatientRecordsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = usePatientRecords(id || '', page);

  if (isLoading) return <DashboardSkeleton />;

  const records = data?.content ?? [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link to="/admin/users" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Records</h1>
          <p className="text-sm text-slate-500 mt-1">Reviewing complete medical history and audit logs.</p>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-danger-50 border border-danger-100 rounded-lg text-sm text-danger-700">
          {(error as any)?.response?.data?.message || 'Failed to fetch patient records'}
        </div>
      ) : records.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4 mx-auto border border-slate-100">
            <FileText className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No medical records found for this patient.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record.id} className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Record #{record.id.substring(0, 8)}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Created {formatRelativeTime(record.createdAt)} by Dr. {record.doctorName}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/admin/audit-logs?recordId=${record.id}`)}
                  icon={<ShieldAlert className="w-4 h-4" />}
                >
                  Audit Log
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Diagnosis</p>
                  <p className="text-sm text-slate-800">{record.diagnosis}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Prescription</p>
                  <p className="text-sm text-slate-700">{record.prescription}</p>
                </div>
                {record.notes && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">Notes</p>
                    <p className="text-sm text-slate-600 italic">"{record.notes}"</p>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {(data?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} icon={<ChevronLeft className="w-4 h-4" />}>
                Previous
              </Button>
              <span className="text-sm text-slate-500">Page {page + 1} of {data?.totalPages ?? 0}</span>
              <Button variant="secondary" size="sm" disabled={page === (data?.totalPages ?? 0) - 1} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPatientRecordsPage;
