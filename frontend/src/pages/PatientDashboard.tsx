import RoleBasedLayout from '@/components/shared/RoleBasedLayout';
import PatientDashboard from '@/components/patient/PatientDashboard';
export default function PatientDashboardPage() {
  return <RoleBasedLayout><PatientDashboard /></RoleBasedLayout>;
}
