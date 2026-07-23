import React from 'react';
import { useUsers, useActivateDoctor, useDeactivateDoctor } from '../../hooks/useAdminQuery';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { UserCheck } from 'lucide-react';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const DoctorManagementPage: React.FC = () => {
  const { data: users = [], isLoading } = useUsers();
  const activate = useActivateDoctor();
  const deactivate = useDeactivateDoctor();

  const doctors = users.filter(u => u.role === 'ROLE_DOCTOR');
  const pending = doctors.filter(d => !d.active);
  const active = doctors.filter(d => d.active);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>Doctor Management</h1>
        <p>{doctors.length} doctors total, {pending.length} pending approval</p>
      </div>

      {pending.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-slate-100 bg-warning-50">
            <h2 className="text-sm font-semibold text-warning-700 flex items-center gap-2">
              <Badge variant="warning" dot>Pending Approval ({pending.length})</Badge>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pending.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{d.fullName}</td>
                    <td className="px-5 py-3.5 text-slate-500">{d.email}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        onClick={() => activate.mutate(d.id)}
                        disabled={activate.isPending && activate.variables === d.id}
                        loading={activate.isPending && activate.variables === d.id}
                      >
                        Approve
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Active Doctors ({active.length})</h2>
        </div>
        {active.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="w-8 h-8" />}
            title="No Active Doctors"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {active.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{d.fullName}</td>
                    <td className="px-5 py-3.5 text-slate-500">{d.email}</td>
                    <td className="px-5 py-3.5"><Badge variant="success" dot>Active</Badge></td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deactivate.mutate(d.id)}
                        disabled={deactivate.isPending && deactivate.variables === d.id}
                        loading={deactivate.isPending && deactivate.variables === d.id}
                      >
                        Deactivate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DoctorManagementPage;
