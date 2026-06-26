import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import type { UserResponse, AssignmentResponse } from '../../types';
import { Users, UserCog, User, ClipboardList, Shield, Activity } from 'lucide-react';
import { DashboardSkeleton } from '../../components/common/Skeleton';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, assignRes] = await Promise.all([adminAPI.getUsers(), adminAPI.getAssignments()]);
        setUsers(usersRes.data);
        setAssignments(assignRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const doctors = users.filter(u => u.role === 'ROLE_DOCTOR');
  const patients = users.filter(u => u.role === 'ROLE_PATIENT');
  const pendingDoctors = doctors.filter(d => !d.active);

  const stats = [
    { label: 'Total Users', value: users.length, meta: 'All registered accounts', icon: <Users className="w-6 h-6" /> },
    { label: 'Doctors', value: doctors.length, meta: 'Medical personnel', icon: <UserCog className="w-6 h-6" /> },
    { label: 'Patients', value: patients.length, meta: 'Registered patients', icon: <User className="w-6 h-6" /> },
    { label: 'Assignments', value: assignments.length, meta: 'Doctor-Patient links', icon: <ClipboardList className="w-6 h-6" /> },
  ];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage users, doctors, and system assignments.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
           <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
             <div className="flex items-center justify-between mb-5">
               <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-[#0369A1] group-hover:scale-110 transition-transform duration-300">
                 {s.icon}
               </div>
               <span className="text-3xl font-black text-gray-900">{s.value}</span>
             </div>
             <h3 className="text-gray-900 font-bold text-sm tracking-wide mb-1">{s.label}</h3>
             <p className="text-xs font-semibold text-gray-400">{s.meta}</p>
           </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-gray-50/50 p-6 border-b border-gray-100">
               <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2.5">
                 <Shield className="w-5 h-5 text-amber-500" />
                 Action Required
               </h2>
            </div>
            <div className="p-6 flex-1">
              {pendingDoctors.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                    {pendingDoctors.length} doctor(s) pending approval
                  </p>
                  <div className="space-y-3">
                    {pendingDoctors.slice(0, 3).map(d => (
                      <div key={d.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
                        <div>
                          <div className="font-bold text-sm text-gray-900 mb-0.5">{d.fullName}</div>
                          <div className="text-xs font-semibold text-gray-500">{d.email}</div>
                        </div>
                        <button className="px-4 py-2 bg-[#0F4C81] text-white text-xs font-bold rounded-lg hover:bg-[#0369A1] transition-colors shadow-sm">
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                    <ClipboardList className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-1">All caught up!</p>
                  <p className="text-sm font-medium text-gray-500">No pending approvals in queue.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-[#0369A1]" />
                Network Activity
              </h2>
              <button className="text-xs font-bold uppercase tracking-wider text-[#0369A1] hover:text-[#0F4C81] transition-colors">View All Directory</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                  <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium">
                  {users.slice(0, 5).map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-bold mb-1">{u.fullName}</div>
                        <div className="text-gray-500 text-xs font-semibold">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                          {u.role.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.active 
                          ? <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span> 
                          : <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">Inactive</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
