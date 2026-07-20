import React from 'react';
import { Card } from '../../components/ui/Card';
import { UserCircle, Mail, Calendar } from 'lucide-react';
import { useMyDoctor } from '../../hooks/usePatientQuery';

const MyDoctorPage: React.FC = () => {
  const { data: doctor, isLoading, isError } = useMyDoctor();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="page-header">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Doctor</h1>
          <p className="text-sm text-slate-500 mt-1">Information about your primary care provider</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="page-header">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Doctor</h1>
          <p className="text-sm text-slate-500 mt-1">Information about your primary care provider</p>
        </div>
        <Card className="p-8 text-center border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <UserCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Assigned Doctor</h3>
          <p className="text-slate-500">You have not been assigned to a primary care doctor yet. Please contact administration.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Doctor</h1>
        <p className="text-sm text-slate-500 mt-1">Information about your primary care provider</p>
      </div>

      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold shadow-inner">
            {doctor.fullName?.[0] || 'D'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{doctor.fullName}</h2>
            <p className="text-sm text-slate-500">Primary Care Physician</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{doctor.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Assigned on {new Date(doctor.assignedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MyDoctorPage;
