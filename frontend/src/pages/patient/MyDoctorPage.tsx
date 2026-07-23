import React from 'react';
import { Card } from '../../components/ui/Card';
import { UserCircle, Mail, Calendar } from 'lucide-react';
import { useMyDoctor } from '../../hooks/usePatientQuery';
import { EmptyState } from '../../components/ui/EmptyState';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const MyDoctorPage: React.FC = () => {
  const { data: doctor, isLoading, isError } = useMyDoctor();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>My Doctor</h1>
        <p>Information about your primary care provider</p>
      </div>

      {isError || !doctor ? (
        <Card>
          <EmptyState
            icon={<UserCircle className="w-8 h-8" />}
            title="No Assigned Doctor"
            description="You have not been assigned to a primary care doctor yet. Please contact administration."
          />
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-5 mb-5 pb-5 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold">
              {doctor.fullName?.[0] || 'D'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{doctor.fullName}</h2>
              <p className="text-sm text-slate-500">Primary Care Physician</p>
            </div>
          </div>
          <div className="space-y-3">
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
      )}
    </div>
  );
};

export default MyDoctorPage;
