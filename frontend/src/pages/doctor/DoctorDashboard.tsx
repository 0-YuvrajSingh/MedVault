import React, { useState } from 'react';
import { useDoctorPatients } from '../../hooks/useDoctorQuery';
import { Users, Calendar, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

const DoctorDashboard: React.FC = () => {
  const { data: patients = [], isLoading, isError } = useDoctorPatients();
  const [search, setSearch] = useState('');
  const { fullName } = useAuth();

  const filteredPatients = patients.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good morning, Dr. {fullName?.split(' ')[0] || ''}</h1>
          <p className="text-sm text-slate-500 mt-1">Here is your daily overview and recent patient assignments.</p>
        </div>
        <Card className="p-6">
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-danger-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Failed to load dashboard</h3>
            <p className="text-sm text-slate-500 mb-4">Unable to load patient data. Please try again later.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good morning, Dr. {fullName?.split(' ')[0] || ''}</h1>
        <p className="text-sm text-slate-500 mt-1">Here is your daily overview and recent patient assignments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Recent Assignments</h3>
            <div className="space-y-2">
              {patients.slice(0, 3).map(p => (
                <Link to={`/doctor/patients/${p.id}/records`} key={p.id} className="block p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-primary-50 hover:border-primary-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {p.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{p.fullName}</div>
                      <div className="text-xs text-slate-400">View records</div>
                    </div>
                  </div>
                </Link>
              ))}
              {patients.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No assignments yet.</p>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="text-lg font-bold text-slate-900">{patients.length}</div>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">Assigned Patients</span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-lg font-bold text-slate-900">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">Today</span>
              </div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-sm font-semibold text-slate-900">Patient Roster</h2>
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>
            {filteredPatients.length === 0 ? (
              <EmptyState
                icon={<Users className="w-8 h-8" />}
                title={search ? 'No patients match your search' : 'No patients assigned'}
                description={search ? 'Try a different name or email.' : 'Contact administration to receive your patient roster.'}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredPatients.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                              {p.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-slate-900 font-medium">{p.fullName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{p.email}</td>
                        <td className="px-5 py-3.5 text-right">
                          <Link to={`/doctor/patients/${p.id}/records`}>
                            <Button variant="secondary" size="sm">View Records</Button>
                          </Link>
                        </td>
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

export default DoctorDashboard;
