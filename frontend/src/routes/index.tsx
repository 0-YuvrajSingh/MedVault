import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRedirect from './RoleRedirect';

// Route-level code splitting: each portal page loads on demand.
const HomePage = lazy(() => import('../pages/public/HomePage'));

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const UsersPage = lazy(() => import('../pages/admin/UsersPage'));
const DoctorManagementPage = lazy(() => import('../pages/admin/DoctorManagementPage'));
const AssignmentsPage = lazy(() => import('../pages/admin/AssignmentsPage'));
const AuditLogsPage = lazy(() => import('../pages/admin/AuditLogsPage'));
const SystemHealthPage = lazy(() => import('../pages/admin/SystemHealthPage'));

const DoctorDashboard = lazy(() => import('../pages/doctor/DoctorDashboard'));
const PatientsPage = lazy(() => import('../pages/doctor/PatientsPage'));
const RecordsPage = lazy(() => import('../pages/doctor/RecordsPage'));
const DoctorReviewsPage = lazy(() => import('../pages/doctor/DoctorReviewsPage'));
const DoctorTimelinePage = lazy(() => import('../pages/doctor/DoctorTimelinePage'));
const DoctorNotificationsPage = lazy(() => import('../pages/doctor/DoctorNotificationsPage'));

const PatientDashboard = lazy(() => import('../pages/patient/PatientDashboard'));
const MedicalRecordsPage = lazy(() => import('../pages/patient/MedicalRecordsPage'));
const PatientTimelinePage = lazy(() => import('../pages/patient/PatientTimelinePage'));
const MyDoctorPage = lazy(() => import('../pages/patient/MyDoctorPage'));
const PatientNotificationsPage = lazy(() => import('../pages/patient/PatientNotificationsPage'));

const SettingsPage = lazy(() => import('../pages/shared/SettingsPage'));

const PageFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[40vh] text-sm text-slate-500">
    Loading…
  </div>
);

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<PageFallback />}>{node}</Suspense>
);

const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: withSuspense(<HomePage />) },
    ],
  },
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: withSuspense(<LoginPage />) },
      { path: '/register', element: withSuspense(<RegisterPage />) },
    ],
  },
  // Dashboard redirect
  {
    path: '/dashboard',
    element: <RoleRedirect />,
  },
  // Admin routes
  {
    element: <ProtectedRoute allowedRoles={['ROLE_ADMIN']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/admin', element: withSuspense(<AdminDashboard />) },
          { path: '/admin/users', element: withSuspense(<UsersPage />) },
          { path: '/admin/approvals', element: withSuspense(<DoctorManagementPage />) },
          { path: '/admin/assignments', element: withSuspense(<AssignmentsPage />) },
          { path: '/admin/audit-logs', element: withSuspense(<AuditLogsPage />) },
          { path: '/admin/system-health', element: withSuspense(<SystemHealthPage />) },
          { path: '/admin/settings', element: withSuspense(<SettingsPage />) },
        ],
      },
    ],
  },
  // Doctor routes
  {
    element: <ProtectedRoute allowedRoles={['ROLE_DOCTOR']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/doctor', element: withSuspense(<DoctorDashboard />) },
          { path: '/doctor/patients', element: withSuspense(<PatientsPage />) },
          { path: '/doctor/records', element: withSuspense(<RecordsPage />) },
          { path: '/doctor/patients/:patientId/records', element: withSuspense(<RecordsPage />) },
          { path: '/doctor/reviews', element: withSuspense(<DoctorReviewsPage />) },
          { path: '/doctor/timeline', element: withSuspense(<DoctorTimelinePage />) },
          { path: '/doctor/notifications', element: withSuspense(<DoctorNotificationsPage />) },
          { path: '/doctor/settings', element: withSuspense(<SettingsPage />) },
        ],
      },
    ],
  },
  // Patient routes
  {
    element: <ProtectedRoute allowedRoles={['ROLE_PATIENT']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/patient', element: withSuspense(<PatientDashboard />) },
          { path: '/patient/records', element: withSuspense(<MedicalRecordsPage />) },
          { path: '/patient/my-doctor', element: withSuspense(<MyDoctorPage />) },
          { path: '/patient/timeline', element: withSuspense(<PatientTimelinePage />) },
          { path: '/patient/notifications', element: withSuspense(<PatientNotificationsPage />) },
          { path: '/patient/settings', element: withSuspense(<SettingsPage />) },
        ],
      },
    ],
  },
]);

const AppRouter: React.FC = () => <RouterProvider router={router} />;

export default AppRouter;
