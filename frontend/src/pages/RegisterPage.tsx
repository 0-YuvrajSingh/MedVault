import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, User, Stethoscope, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoleOption {
  role: 'patient' | 'doctor';
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  path: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'patient',
    icon: User,
    title: 'I\'m a Patient',
    description: 'Manage your health records, book appointments, and stay connected with your doctors.',
    features: ['Book appointments online', 'Access medical records', 'Share documents securely'],
    gradient: 'from-emerald-500 to-emerald-600',
    path: '/register/patient',
  },
  {
    role: 'doctor',
    icon: Stethoscope,
    title: 'I\'m a Doctor',
    description: 'Manage your practice, access patient records, and streamline your clinical workflow.',
    features: ['Manage patient appointments', 'Access shared medical records', 'Verify prescriptions'],
    gradient: 'from-violet-500 to-violet-600',
    path: '/register/doctor',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface dark:bg-neutral-950 p-4 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-violet-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-4xl relative z-10"
      >
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-emerald-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-xl mb-4">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Join MedVault
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            Choose your account type to get started. You can always update your details later.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {ROLE_OPTIONS.map((option, i) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={option.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.1 }}
                onClick={() => navigate(option.path)}
                className="group text-left w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-7 hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  {option.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5 leading-relaxed">
                  {option.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {option.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white group-hover:gap-3 transition-all">
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-neutral-900 dark:text-white hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
