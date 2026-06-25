import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'ROLE_DOCTOR') return <Navigate to="/doctor" replace />;
  if (role === 'ROLE_PATIENT') return <Navigate to="/patient" replace />;

  return <Navigate to="/login" replace />;
};

export default RoleRedirect;
