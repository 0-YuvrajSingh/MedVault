/**
 * RoleBasedLayout — legacy compatibility shim.
 * Dashboard routing now uses nested routes + DashboardLayout with <Outlet>.
 * This component is no longer needed for new routes but kept so any
 * remaining import doesn't break the build.
 */
import React from 'react';

interface RoleBasedLayoutProps {
  children?: React.ReactNode;
}

const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ children }) => {
  // No-op wrapper — layout is now provided by the nested route pattern
  // in AppRoutes.tsx via DashboardLayout + Outlet.
  return <>{children}</>;
};

export default RoleBasedLayout;
