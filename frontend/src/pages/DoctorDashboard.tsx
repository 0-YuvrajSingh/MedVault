import RoleBasedLayout from '@/components/shared/RoleBasedLayout';
import DoctorDashboard from '@/components/doctor/DoctorDashboard';
export default function DoctorDashboardPage() {
  return <RoleBasedLayout><DoctorDashboard /></RoleBasedLayout>;
}
