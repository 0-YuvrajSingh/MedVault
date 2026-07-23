import React from 'react';
import { useDoctorPatients } from '../../hooks/useDoctorQuery';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users } from 'lucide-react';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const PatientsPage: React.FC = () => {
  const { data: patients = [], isLoading } = useDoctorPatients();
  const navigate = useNavigate();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>Patients</h1>
        <p>{patients.length} assigned patients</p>
      </div>

      <Card>
        {patients.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title="No Patients Assigned"
            description="An admin must create assignments first."
          />
        ) : (
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
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">{p.fullName}</td>
                    <td className="px-5 py-3.5 text-slate-500">{p.email}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/doctor/patients/${p.id}/records`)}>
                        View Records
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

export default PatientsPage;
