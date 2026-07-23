import React from 'react';
import { useUsers, useAssignments } from '../../hooks/useAdminQuery';
import { Users, UserCog, User, ClipboardList, Shield, Activity, BarChart3 } from 'lucide-react';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { data: users = [], isLoading: usersLoading, isError: usersError } = useUsers();
  const { data: assignments = [], isLoading: assignmentsLoading, isError: assignmentsError } = useAssignments();

  const doctors = users.filter(u => u.role === 'ROLE_DOCTOR');
  const patients = users.filter(u => u.role === 'ROLE_PATIENT');
  const admins = users.filter(u => u.role === 'ROLE_ADMIN');
  const pendingDoctors = doctors.filter(d => !d.active);

  const roleChartData = [
    { name: 'Admin', count: admins.length, fill: '#2563EB' },
    { name: 'Doctor', count: doctors.length, fill: '#0D9488' },
    { name: 'Patient', count: patients.length, fill: '#059669' },
  ];

  if (usersLoading || assignmentsLoading) return <DashboardSkeleton />;

  if (usersError || assignmentsError) {
    return (
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage users, doctors, and system assignments.</p>
        </div>
        <Card className="p-6">
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-danger-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Failed to load dashboard</h3>
            <p className="text-sm text-slate-500 mb-4">Unable to load system data. Please try again later.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Manage users, doctors, and system assignments.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: <Users className="w-5 h-5" />, color: 'bg-primary-50 text-primary-600' },
          { label: 'Doctors', value: doctors.length, icon: <UserCog className="w-5 h-5" />, color: 'bg-teal-50 text-teal-600' },
          { label: 'Patients', value: patients.length, icon: <User className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
          { label: 'Assignments', value: assignments.length, icon: <ClipboardList className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                {s.icon}
              </div>
              <span className="text-2xl font-bold text-slate-900">{s.value}</span>
            </div>
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-primary-600" />
              Users by Role
            </h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                Action Required
              </h2>
            </div>
            <div className="p-5">
              {pendingDoctors.length > 0 ? (
                <div className="space-y-3">
                  <Badge variant="warning" dot>{pendingDoctors.length} pending approval</Badge>
                  {pendingDoctors.slice(0, 3).map(d => (
                    <div key={d.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                      <div className="text-sm font-medium text-slate-900">{d.fullName}</div>
                      <div className="text-xs text-slate-400">{d.email}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ClipboardList className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">All caught up!</p>
                  <p className="text-xs text-slate-500">No pending approvals.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-600" />
            Recent Activity
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.slice(0, 5).map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-slate-900">{u.fullName}</div>
                    <div className="text-xs text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="neutral">{u.role.replace('ROLE_', '')}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.active ? <Badge variant="success" dot>Active</Badge> : <Badge variant="danger" dot>Inactive</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
