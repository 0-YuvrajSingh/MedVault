import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import type { MedicalRecord } from '../../types';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, Activity, FileText, Calendar, ShieldAlert } from 'lucide-react';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { formatRelativeTime } from '../../utils/date';

const AdminPatientRecordsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getPatientRecords(id, page, 10);
        setRecords(res.data.content);
        setTotalPages(res.data.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch patient records');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [id, page]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/users" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Records</h1>
          <p className="text-sm text-slate-500 mt-1">Reviewing complete medical history and audit logs.</p>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">{error}</div>
      ) : records.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No medical records found for this patient.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record.id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Record #{record.id.substring(0, 8)}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Created {formatRelativeTime(record.createdAt)} by Dr. {record.doctorName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/admin/audit-logs?recordId=${record.id}`)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  View Audit Log
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Diagnosis</h4>
                  <p className="text-slate-700 text-sm">{record.diagnosis}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Prescription</h4>
                  <p className="text-slate-700 text-sm">{record.prescription}</p>
                </div>
                {record.notes && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Notes</h4>
                    <p className="text-slate-600 text-sm italic">"{record.notes}"</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-slate-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPatientRecordsPage;
