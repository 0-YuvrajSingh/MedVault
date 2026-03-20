import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Page Container with Navbar and Footer
 */
const PageContainer = ({ children, showNavbar = true, showFooter = true, maxWidth = '7xl', className = '' }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && user && <Navbar />}
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex-1 ${className}`}
      >
        <div className={`max-w-${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
          {children}
        </div>
      </motion.main>

      {showFooter && <Footer />}
    </div>
  );
};

export default PageContainer;
