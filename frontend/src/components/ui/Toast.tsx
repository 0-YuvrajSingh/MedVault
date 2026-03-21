// @ts-nocheck
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

/**
 * Toast Provider Component
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: toast.type || 'info',
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 5000,
    };

    setToasts(prev => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (title, message, duration) => addToast({ type: 'success', title, message, duration }),
    error: (title, message, duration) => addToast({ type: 'error', title, message, duration }),
    warning: (title, message, duration) => addToast({ type: 'warning', title, message, duration }),
    info: (title, message, duration) => addToast({ type: 'info', title, message, duration }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Toast Container Component
 */
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Individual Toast Component
 */
const Toast = ({ toast, onClose }) => {
  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgClass: 'bg-success/10 border-success/20',
      iconClass: 'text-success',
      textClass: 'text-success',
    },
    error: {
      icon: XCircle,
      bgClass: 'bg-error/10 border-error/20',
      iconClass: 'text-error',
      textClass: 'text-error',
    },
    warning: {
      icon: AlertCircle,
      bgClass: 'bg-warning/10 border-warning/20',
      iconClass: 'text-warning',
      textClass: 'text-warning',
    },
    info: {
      icon: Info,
      bgClass: 'bg-info/10 border-info/20',
      iconClass: 'text-info',
      textClass: 'text-info',
    },
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`
        pointer-events-auto
        backdrop-blur-lg bg-white/90 dark:bg-neutral-900/90
        border rounded-2xl p-4 shadow-xl
        ${config.bgClass}
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className={`font-semibold mb-0.5 ${config.textClass}`}>
              {toast.title}
            </h4>
          )}
          {toast.message && (
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {toast.message}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>
      </div>
    </motion.div>
  );
};

export default ToastProvider;
