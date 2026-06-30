import React, { useEffect, useState } from 'react';
import { doctorAPI } from '../../api/doctor';
import type { UserResponse } from '../../types';
import { Users, FileText, Calendar, Clock, Search, UserX, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { DashboardSkeleton } from '../../components/common/Skeleton';

const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { fullName } = useAuth();

  useEffect(() => {
    doctorAPI.getPatients().then(r => setPatients(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Assigned Patients', value: patients.length, icon: <Users className="w-5 h-5" /> },
    { label: 'Active Records', value: '—', icon: <FileText className="w-5 h-5" /> },
    { label: 'Date', value: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), icon: <Calendar className="w-5 h-5" /> },
  ];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Dr. {fullName?.split(' ')[0] || ''}</h1>
          <p className="text-sm text-gray-500 mt-1">Here is your daily overview and recent patient assignments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alerts & Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-gray-900 font-extrabold text-lg mb-5 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              Recent Assignments
            </h3>
            <div className="space-y-3">
              {patients.slice(0, 3).map(p => (
                <Link to={`/doctor/patients/${p.id}/records`} key={p.id} className="block bg-teal-50/50 border border-teal-100 rounded-xl p-4 hover:bg-teal-100/50 transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="mt-0.5"><Clock className="w-4 h-4 text-teal-500" /></div>
                    <div>
                      <div className="text-sm font-bold text-teal-900 mb-0.5">{p.fullName}</div>
                      <div className="text-xs font-semibold text-teal-700">Needs initial checkup</div>
                    </div>
                  </div>
                </Link>
              ))}
              {patients.length === 0 && (
                <div className="text-sm font-medium text-gray-500 py-4 text-center">No recent assignments.</div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform duration-300">
                    {s.icon}
                  </div>
                </div>
                <div className="text-2xl font-black text-gray-900">{s.value}</div>
                <h3 className="text-gray-500 font-bold text-[10px] tracking-widest uppercase mt-1.5">{s.label}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Patients */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Patient Roster
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input type="text" placeholder="Search patients..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm" />
              </div>
            </div>

            <div className="p-0 overflow-x-auto flex-1">
              {patients.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserX className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-gray-900 font-bold text-lg mb-1">No patients assigned</div>
                  <div className="text-gray-500 text-sm font-medium">Contact administration to receive your patient roster.</div>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-white text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr><th className="px-6 py-4">Patient Profile</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4 text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {patients.map(p => (
                      <tr key={p.id} className="hover:bg-teal-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-black text-xs shadow-sm">
                              {p.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="text-gray-900 font-bold">{p.fullName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs font-semibold">{p.email}</td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/doctor/patients/${p.id}/records`} className="inline-block px-4 py-2 bg-white border border-slate-200 text-gray-700 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 rounded-lg text-xs font-bold transition-all shadow-sm">
                            View File
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
