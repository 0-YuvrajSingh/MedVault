import React from 'react';
import { usePatientRecords } from '../../hooks/usePatientQuery';
import { FileText, Activity, UserCircle, ArrowRight } from 'lucide-react';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRecordTimestamp } from '../../utils/date';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const { data, isLoading, isError } = usePatientRecords(0);
  const { fullName } = useAuth();

  const records = data?.content ?? [];
  const latest = records[0];

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {fullName?.split(' ')[0] || ''}</h1>
          <p className="text-sm text-slate-500 mt-1">Here is an overview of your medical records and care team.</p>
        </div>
        <Card className="p-6">
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-danger-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Failed to load dashboard</h3>
            <p className="text-sm text-slate-500 mb-4">Unable to load your medical data. Please try again later.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hello, {fullName?.split(' ')[0] || ''}</h1>
        <p className="text-sm text-slate-500 mt-1">Here is an overview of your medical records and care team.</p>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        <div className="2xl:col-span-1 min-w-0 space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Medical Records</p>
                <p className="text-xl font-bold text-slate-900">{records.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Latest Diagnosis</p>
                <p className="text-base font-semibold text-slate-900 truncate">{latest?.diagnosis || '—'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Primary Doctor</p>
                <p className="text-base font-semibold text-slate-900 truncate">{latest?.doctorName || '—'}</p>
              </div>
            </div>
          </Card>

          <Link to="/patient/records" className="block mt-2">
            <Button variant="secondary" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
              View All Records
            </Button>
          </Link>
        </div>

        <div className="2xl:col-span-2 min-w-0">
          <Card>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Recent Medical Records</h2>
              {records.length > 0 && (
                <Link to="/patient/records" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              )}
            </div>
            {records.length === 0 ? (
              <EmptyState
                icon={<Activity className="w-8 h-8" />}
                title="No records found"
                description="Your medical history is currently empty."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Diagnosis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {records.slice(0, 5).map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="text-slate-900 font-medium"><time dateTime={r.createdAt} title={r.createdAt}>{formatRecordTimestamp(r.createdAt)}</time></span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{r.doctorName}</td>
                        <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate">{r.diagnosis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
