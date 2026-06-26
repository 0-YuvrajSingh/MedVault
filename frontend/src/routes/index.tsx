import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRedirect from './RoleRedirect';

// Public pages
import HomePage from '../pages/public/HomePage';
import FeaturesPage from '../pages/public/FeaturesPage';
import SecurityPage from '../pages/public/SecurityPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UsersPage from '../pages/admin/UsersPage';
import DoctorManagementPage from '../pages/admin/DoctorManagementPage';
import AssignmentsPage from '../pages/admin/AssignmentsPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';

// Doctor pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import PatientsPage from '../pages/doctor/PatientsPage';
import RecordsPage from '../pages/doctor/RecordsPage';

// Patient pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import MedicalRecordsPage from '../pages/patient/MedicalRecordsPage';

const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/features', element: <FeaturesPage /> },
      { path: '/security', element: <SecurityPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> },
    ],
  },
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
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
          { path: '/admin', element: <AdminDashboard /> },
          { path: '/admin/users', element: <UsersPage /> },
          { path: '/admin/doctors', element: <DoctorManagementPage /> },
          { path: '/admin/assignments', element: <AssignmentsPage /> },
          { path: '/admin/audit', element: <AuditLogsPage /> },
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
          { path: '/doctor', element: <DoctorDashboard /> },
          { path: '/doctor/patients', element: <PatientsPage /> },
          { path: '/doctor/patients/:patientId/records', element: <RecordsPage /> },
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
          { path: '/patient', element: <PatientDashboard /> },
          { path: '/patient/records', element: <MedicalRecordsPage /> },
        ],
      },
    ],
  },
]);

const AppRouter: React.FC = () => <RouterProvider router={router} />;

export default AppRouter;
