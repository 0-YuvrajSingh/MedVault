import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="text-center max-w-xl w-full">

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-28 h-28 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl mb-7">
          <ShieldAlert className="w-14 h-14 text-white" strokeWidth={2} />
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-7xl font-bold text-red-600 dark:text-red-500 mb-3">403</motion.p>

        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Access Denied</motion.h2>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm mx-auto">
          You don't have permission to access this page. This area is restricted to authorized users only.
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white rounded-xl text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="p-5 bg-red-50 dark:bg-neutral-800 rounded-2xl border border-red-100 dark:border-neutral-700 text-left max-w-sm mx-auto">
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Why am I seeing this?</p>
          <ul className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            <li>• You're not logged in or your session expired</li>
            <li>• You don't have the required role for this page</li>
            <li>• This resource requires specific permissions</li>
          </ul>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-6 text-xs text-neutral-400">
          Need help?{' '}
          <a href="mailto:support@medvault.com" className="text-red-500 hover:underline font-medium">
            support@medvault.com
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
