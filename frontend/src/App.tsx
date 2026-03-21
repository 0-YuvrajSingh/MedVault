// @ts-nocheck
import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { api, injectAxiosToken } from './api';
import AppRoutes from './components/AppRoutes';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';

function AxiosTokenSync() {
  const { token } = useAuth() as { token: string | null };
  React.useEffect(() => {
    if (api.interceptors.request.handlers.length > 0) {
      api.interceptors.request.handlers = [];
    }
    injectAxiosToken(token);
  }, [token]);
  return null;
}

// Only show public Navbar + Footer on non-dashboard routes
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const isDashboard = /^\/(patient|doctor|admin)\//.test(pathname);

  return (
    <>
      {!isDashboard && <Navbar />}
      <main
        id="main-content"
        className={isDashboard ? '' : 'pt-16'}
        role="main"
      >
        {children}
      </main>
      {!isDashboard && <Footer />}
    </>
  );
};

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <BrowserRouter>
        <AuthProvider>
          <AxiosTokenSync />
          <ToastProvider>
            <PublicLayout>
              <AppRoutes />
            </PublicLayout>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}
