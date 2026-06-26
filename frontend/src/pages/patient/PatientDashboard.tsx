import React, { useEffect, useState } from 'react';
import { patientAPI } from '../../api/patient';
import type { MedicalRecordResponse } from '../../types';
import { FileText, Activity, UserCircle, Archive } from 'lucide-react';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { formatRelativeTime } from '../../utils/date';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { fullName } = useAuth();

  useEffect(() => {
    patientAPI.getRecords().then(r => setRecords(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const latest = records[0];

  const stats = [
    { label: 'Medical Records', value: records.length, icon: <FileText className="w-5 h-5" /> },
    { label: 'Latest Diagnosis', value: latest?.diagnosis || '—', icon: <Activity className="w-5 h-5" /> },
    { label: 'Primary Doctor', value: latest?.doctorName || '—', icon: <UserCircle className="w-5 h-5" /> },
  ];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {fullName.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-1">Here is an overview of your medical records and care team.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Actions */}
        <div className="lg:col-span-1 space-y-6">
           <div className="grid grid-cols-1 gap-4">
              {stats.map(s => (
                 <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
                       {s.icon}
                     </div>
                     <div className="min-w-0">
                       <h3 className="text-gray-500 font-bold text-[10px] tracking-widest uppercase mb-1">{s.label}</h3>
                       <div className="text-xl font-black text-gray-900 truncate">{s.value}</div>
                     </div>
                   </div>
                 </div>
              ))}
           </div>
           
           <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 shadow-sm">
             <h3 className="text-emerald-900 font-extrabold text-lg mb-2 flex items-center gap-2">
               <Archive className="w-5 h-5 text-emerald-600" />
               Full Medical History
             </h3>
             <p className="text-emerald-700 text-sm font-medium mb-4">Access and review all of your securely encrypted medical records.</p>
             <Link to="/patient/records" className="block text-center w-full py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
               View All Records
             </Link>
           </div>
        </div>

        {/* Right Column: Recent Records */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Recent Medical History
              </h2>
              <Link to="/patient/records" className="text-xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors">
                View All
              </Link>
            </div>
            
            <div className="p-0 overflow-x-auto flex-1">
              {records.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-gray-900 font-bold text-lg mb-1">No records found</div>
                  <div className="text-gray-500 text-sm font-medium">Your medical history is currently empty.</div>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-white text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                    <tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Doctor</th><th className="px-6 py-4">Diagnosis</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {records.slice(0, 5).map(r => (
                      <tr key={r.id} className="hover:bg-emerald-50/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-gray-900 font-bold mb-1">{formatRelativeTime(r.createdAt)}</div>
                          <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Record</div>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-bold">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-emerald-500" />
                            {r.doctorName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium max-w-xs truncate">
                          {r.diagnosis}
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

export default PatientDashboard;
