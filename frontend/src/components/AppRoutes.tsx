import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ErrorFallback from '../components/ErrorFallback';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/shared/DashboardLayout';
import { ErrorBoundary } from '../components/ui';

// Public Pages
import CompleteProfile     from '../pages/CompleteProfile';
import FeedbackForm        from '../pages/FeedbackForm';
import ForgotPassword      from '../pages/ForgotPassword';
import LandingPage         from '../pages/LandingPage';
import Login               from '../pages/Login';
import NotFound            from '../pages/NotFound';
import PrivacyPolicy       from '../pages/PrivacyPolicy';
import RegisterDoctor      from '../pages/RegisterDoctor';
import RegisterPage        from '../pages/RegisterPage';
import RegisterPatient     from '../pages/RegisterPatient';
import Terms               from '../pages/Terms';
import Unauthorized        from '../pages/Unauthorized';

// Patient pages
import AppointmentBooking   from '../components/patient/AppointmentBooking';
import DocumentPermissions  from '../components/patient/DocumentPermissions';
import MedicalRecords       from '../components/patient/MedicalRecords';
import MyAppointments       from '../components/patient/MyAppointments';
import MyProfile            from '../components/patient/MyProfile';
import PatientDashboard     from '../components/patient/PatientDashboard';
import Reviews              from '../components/patient/Reviews';

// Doctor pages
import AppointmentManagement from '../components/doctor/AppointmentManagement';
import BookingRequests       from '../components/doctor/BookingRequests';
import CreateSlots           from '../components/doctor/CreateSlots';
import DoctorDashboard       from '../components/doctor/DoctorDashboard';
import DoctorMedicalRecords  from '../components/doctor/DoctorMedicalRecords';
import DoctorProfile         from '../components/doctor/DoctorProfile';
import DocumentVerification  from '../components/doctor/DocumentVerification';
import Patients              from '../components/doctor/Patients';
import ReviewsRatings        from '../components/doctor/ReviewsRatings';

// Admin pages
import AdminDashboard            from '../components/admin/AdminDashboard';
import AdminDocumentVerification from '../components/admin/AdminDocumentVerification';
import AdminProfile              from '../components/admin/AdminProfile';
import DoctorVerifications       from '../components/admin/DoctorVerifications';
import ManageDoctors             from '../components/admin/ManageDoctors';
import ManagePatients            from '../components/admin/ManagePatients';
import ManageUsers               from '../components/admin/ManageUsers';
import SystemReports             from '../components/admin/SystemReports';

// ─── Public page wrapper (fade-in only) ──────────────────────────────────────

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

// ─── Layout route wrappers ────────────────────────────────────────────────────
// These render DashboardLayout (with Outlet) — layout stays mounted across
// all child routes. Only the <Outlet> content animates on navigation.

const PatientLayout: React.FC = () => (
  <ProtectedRoute allowedRoles={['PATIENT']}>
    <DashboardLayout />
  </ProtectedRoute>
);

const DoctorLayout: React.FC = () => (
  <ProtectedRoute allowedRoles={['DOCTOR']}>
    <DashboardLayout />
  </ProtectedRoute>
);

const AdminLayout: React.FC = () => (
  <ProtectedRoute allowedRoles={['ADMIN']}>
    <DashboardLayout />
  </ProtectedRoute>
);

// ─── ErrorBoundary wrapper ────────────────────────────────────────────────────

const Safe: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
    {children}
  </ErrorBoundary>
);

// ─── Routes ──────────────────────────────────────────────────────────────────

const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    // NO key prop on Routes — prevents full remount on navigation
    <Routes>

      {/* ── Public routes ──────────────────────────────────────────────── */}
      <Route path="/" element={<AnimatePresence mode="wait"><Page key="landing"><LandingPage /></Page></AnimatePresence>} />
      <Route path="/login" element={<Page><Login /></Page>} />
      <Route path="/register" element={<Page><RegisterPage /></Page>} />
      <Route path="/register/doctor" element={<Page><RegisterDoctor /></Page>} />
      <Route path="/register/patient" element={<Page><RegisterPatient /></Page>} />
      <Route path="/unauthorized" element={<Page><Unauthorized /></Page>} />
      <Route path="/feedback" element={<Page><FeedbackForm /></Page>} />
      <Route path="/forgot-password" element={<Page><ForgotPassword /></Page>} />
      <Route path="/terms" element={<Page><Terms /></Page>} />
      <Route path="/privacy" element={<Page><PrivacyPolicy /></Page>} />

      {/* ── Patient routes — layout persists across navigation ─────────── */}
      <Route element={<PatientLayout />}>
        <Route path="/patient/dashboard"            element={<Safe><PatientDashboard /></Safe>} />
        <Route path="/patient/book-appointment"     element={<Safe><AppointmentBooking /></Safe>} />
        <Route path="/patient/my-appointments"      element={<Safe><MyAppointments /></Safe>} />
        <Route path="/patient/medical-records"      element={<Safe><MedicalRecords /></Safe>} />
        <Route path="/patient/reviews"              element={<Safe><Reviews /></Safe>} />
        <Route path="/patient/profile"              element={<Safe><MyProfile /></Safe>} />
        <Route path="/patient/document-permissions" element={<Safe><DocumentPermissions /></Safe>} />
      </Route>

      {/* ── Doctor routes — layout persists across navigation ──────────── */}
      <Route element={<DoctorLayout />}>
        <Route path="/doctor/dashboard"        element={<Safe><DoctorDashboard /></Safe>} />
        <Route path="/doctor/appointments"     element={<Safe><AppointmentManagement /></Safe>} />
        <Route path="/doctor/booking-requests" element={<Safe><BookingRequests /></Safe>} />
        <Route path="/doctor/slots"            element={<Safe><CreateSlots /></Safe>} />
        <Route path="/doctor/patients"         element={<Safe><Patients /></Safe>} />
        <Route path="/doctor/medical-records"  element={<Safe><DoctorMedicalRecords /></Safe>} />
        <Route path="/doctor/reviews"          element={<Safe><ReviewsRatings /></Safe>} />
        <Route path="/doctor/profile"          element={<Safe><DoctorProfile /></Safe>} />
        <Route path="/doctor/documents"        element={<Safe><DocumentVerification /></Safe>} />
        <Route path="/doctor/complete-profile" element={<Safe><CompleteProfile /></Safe>} />
      </Route>

      {/* ── Admin routes — layout persists across navigation ───────────── */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard"     element={<Safe><AdminDashboard /></Safe>} />
        <Route path="/admin/users"         element={<Safe><ManageUsers /></Safe>} />
        <Route path="/admin/verifications" element={<Safe><DoctorVerifications /></Safe>} />
        <Route path="/admin/reports"       element={<Safe><SystemReports /></Safe>} />
        <Route path="/admin/doctors"       element={<Safe><ManageDoctors /></Safe>} />
        <Route path="/admin/patients"      element={<Safe><ManagePatients /></Safe>} />
        <Route path="/admin/documents"     element={<Safe><AdminDocumentVerification /></Safe>} />
        <Route path="/admin/profile"       element={<Safe><AdminProfile /></Safe>} />
      </Route>

      {/* ── Legacy redirects ───────────────────────────────────────────── */}
      <Route path="/patient-dashboard" element={<Navigate to="/patient/dashboard" replace />} />
      <Route path="/doctor-dashboard"  element={<Navigate to="/doctor/dashboard"  replace />} />
      <Route path="/admin-dashboard"   element={<Navigate to="/admin/dashboard"   replace />} />

      {/* ── 404 ────────────────────────────────────────────────────────── */}
      <Route path="*" element={<Page><NotFound /></Page>} />
    </Routes>
  );
};

export default AppRoutes;
