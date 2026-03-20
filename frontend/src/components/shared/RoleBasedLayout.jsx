import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import PatientSidebar from '../patient/PatientSidebar';
import DoctorSidebar from '../doctor/DoctorSidebar';
import AdminSidebar from '../admin/AdminSidebar';

export default function RoleBasedLayout({ children, loading = false }) {
  const { user } = useAuth();

  const getSidebar = () => {
    if (!user || !user.role) return null;
    
    switch (user.role.toUpperCase()) {
      case 'PATIENT':
        return <PatientSidebar />;
      case 'DOCTOR':
        return <DoctorSidebar />;
      case 'ADMIN':
        return <AdminSidebar />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        {getSidebar()}
        <div className="ml-64 pt-16 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {getSidebar()}
      <div className="ml-64 pt-16 min-h-screen bg-slate-50">
        {children}
      </div>
    </>
  );
}
