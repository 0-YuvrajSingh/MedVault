import React from "react";
import { BrowserRouter } from "react-router-dom";
import { api, injectAxiosToken } from "./api";
import AppRoutes from "./components/AppRoutes";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { ToastProvider } from "./components/ui/Toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AxiosTokenSync() {
  const { token } = useAuth();
  React.useEffect(() => {
    // Remove previous interceptors to avoid stacking
    if (api.interceptors.request.handlers.length > 0) {
      api.interceptors.request.handlers = [];
    }
    injectAxiosToken(token);
  }, [token]);
  return null;
}

export default function App() {
  return (
    <>
      {/* Skip to content link for keyboard navigation */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <BrowserRouter>
        <AuthProvider>
          <AxiosTokenSync />
          <ToastProvider>
            <Layout>
              <AppRoutes />
            </Layout>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

// Layout wrapper to show Navbar and Footer
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main id="main-content" className="pt-16" role="main">
        {children}
      </main>
      <Footer />
    </>
  );
};
