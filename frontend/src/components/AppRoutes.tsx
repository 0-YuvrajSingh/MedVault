// @ts-nocheck
import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ErrorFallback from "../components/ErrorFallback";
import ProtectedRoute from "../components/ProtectedRoute";
import PageTransition from "../components/shared/PageTransition";
import { ErrorBoundary } from "../components/ui";

// Public Pages
import CompleteProfile from "../pages/CompleteProfile";
import FeedbackForm from "../pages/FeedbackForm";
import ForgotPassword from "../pages/ForgotPassword";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import RegisterDoctor from "../pages/RegisterDoctor";
import RegisterPage from "../pages/RegisterPage";
import RegisterPatient from "../pages/RegisterPatient";
import Terms from "../pages/Terms";

// Patient Components
import AppointmentBooking from "../components/patient/AppointmentBooking";
import DocumentPermissions from "../components/patient/DocumentPermissions";
import MedicalRecords from "../components/patient/MedicalRecords";
import MyAppointments from "../components/patient/MyAppointments";
import MyProfile from "../components/patient/MyProfile";
import PatientDashboard from "../components/patient/PatientDashboard";
import Reviews from "../components/patient/Reviews";

// Doctor Components
import AppointmentManagement from "../components/doctor/AppointmentManagement";
import BookingRequests from "../components/doctor/BookingRequests";
import CreateSlots from "../components/doctor/CreateSlots";
import DoctorDashboard from "../components/doctor/DoctorDashboard";
import DoctorMedicalRecords from "../components/doctor/DoctorMedicalRecords";
import DoctorProfile from "../components/doctor/DoctorProfile";
import DocumentVerification from "../components/doctor/DocumentVerification";
import Patients from "../components/doctor/Patients";
import ReviewsRatings from "../components/doctor/ReviewsRatings";

// Admin Components
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminDocumentVerification from "../components/admin/AdminDocumentVerification";
import AdminProfile from "../components/admin/AdminProfile";
import DoctorVerifications from "../components/admin/DoctorVerifications";
import ManageDoctors from "../components/admin/ManageDoctors";
import ManagePatients from "../components/admin/ManagePatients";
import ManageUsers from "../components/admin/ManageUsers";
import SystemReports from "../components/admin/SystemReports";
import Unauthorized from "../pages/Unauthorized";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/register/doctor" element={<PageTransition><RegisterDoctor /></PageTransition>} />
        <Route path="/register/patient" element={<PageTransition><RegisterPatient /></PageTransition>} />
        <Route path="/unauthorized" element={<PageTransition><Unauthorized /></PageTransition>} />
        <Route path="/feedback" element={<PageTransition><FeedbackForm /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />

        {/* Patient Routes */}
        <Route
          path="/patient/dashboard"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PageTransition><PatientDashboard /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/patient/book-appointment"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PageTransition><AppointmentBooking /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/patient/my-appointments"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PageTransition><MyAppointments /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/patient/medical-records"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PageTransition><MedicalRecords /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/patient/reviews"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PageTransition><Reviews /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PageTransition><MyProfile /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/patient/document-permissions"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PageTransition><DocumentPermissions /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor/dashboard"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <PageTransition><DoctorDashboard /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <PageTransition><AppointmentManagement /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/doctor/booking-requests"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <PageTransition><BookingRequests /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/doctor/slots"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <PageTransition><CreateSlots /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <PageTransition><Patients /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/doctor/medical-records"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <PageTransition><DoctorMedicalRecords /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/doctor/reviews"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <PageTransition><ReviewsRatings /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <PageTransition><DoctorProfile /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/doctor/documents"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <PageTransition><DocumentVerification /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/doctor/complete-profile"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <PageTransition><CompleteProfile /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PageTransition><AdminDashboard /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PageTransition><ManageUsers /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PageTransition><DoctorVerifications /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PageTransition><SystemReports /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PageTransition><ManageDoctors /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PageTransition><ManagePatients /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PageTransition><AdminDocumentVerification /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PageTransition><AdminProfile /></PageTransition>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        {/* Legacy Redirects */}
        <Route path="/patient-dashboard" element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="/doctor-dashboard" element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

        {/* 404 Not Found - Must be last */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
