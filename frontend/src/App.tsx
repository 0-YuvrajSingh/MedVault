import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard'; // ADDED
import PatientDashboard from './pages/patient/PatientDashboard'; // ADDED

const Home = () => {
  const { role } = useAuth();
  if (role === 'ROLE_ADMIN') return <Navigate to="/admin" />;
  if (role === 'ROLE_DOCTOR') return <Navigate to="/doctor" />;
  if (role === 'ROLE_PATIENT') return <Navigate to="/patient" />;
  return <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* ADDED DOCTOR ROUTE */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_DOCTOR']} />}>
            <Route path="/doctor" element={<DoctorDashboard />} />
          </Route>

          {/* ADDED PATIENT ROUTE */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_PATIENT']} />}>
            <Route path="/patient" element={<PatientDashboard />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
