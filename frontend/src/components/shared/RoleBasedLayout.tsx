/**
 * RoleBasedLayout — thin wrapper kept for backwards compatibility.
 * All layout logic now lives in DashboardLayout.tsx
 */
import React from 'react';
import DashboardLayout from './DashboardLayout';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
}

const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ children, loading = false }) => {
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default RoleBasedLayout;
