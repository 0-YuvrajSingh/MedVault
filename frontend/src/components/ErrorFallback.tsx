// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './ui/Button';


/**
 * Error Fallback UI displayed when ErrorBoundary catches an error
 */
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 5, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center"
            >
              <AlertTriangle className="w-10 h-10 text-white" />
            </motion.div>
          </div>

          {/* Error Message */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Oops! Something went wrong
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              We encountered an unexpected error. Don't worry, our team has been notified.
            </p>
          </div>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={resetErrorBoundary}
              variant="primary"
              size="lg"
              className="flex-1 group"
            >
              <RefreshCw className="w-5 h-5 mr-2 transition-transform group-hover:rotate-180" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorFallback;
