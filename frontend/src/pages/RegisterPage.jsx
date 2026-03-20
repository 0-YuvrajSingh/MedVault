import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, User, Stethoscope, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, Button } from '../components/ui';

const RegisterPage = () => {
  const navigate = useNavigate();

  const roleOptions = [
    {
      role: 'patient',
      icon: User,
      title: 'Patient',
      description: 'Book appointments, manage records, and connect with doctors',
      color: 'from-patient-500 to-patient-600',
      bg: 'bg-patient-50 dark:bg-patient-900/20',
      text: 'text-patient-600',
      path: '/register/patient',
    },
    {
      role: 'doctor',
      icon: Stethoscope,
      title: 'Doctor',
      description: 'Manage appointments, patients, and medical records',
      color: 'from-doctor-500 to-doctor-600',
      bg: 'bg-doctor-50 dark:bg-doctor-900/20',
      text: 'text-doctor-600',
      path: '/register/doctor',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface dark:bg-neutral-900 p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-admin-500/10 to-purple-500/10 blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-500/10 to-teal-500/10 blur-3xl rounded-full transform -translate-x-1/3 translate-y-1/4" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-admin-500 to-admin-600 rounded-2xl flex items-center justify-center shadow-xl mb-6">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Join MedVault
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Choose your account type to get started. Whether you're a patient or a healthcare provider, we have the right tools for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {roleOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <Card
                  variant="premium"
                  hover
                  className="h-full p-8 cursor-pointer group border-2 border-transparent hover:border-admin-500/20"
                  onClick={() => navigate(option.path)}
                >
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-10 h-10 text-white" strokeWidth={2} />
                  </div>

                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                    {option.title}
                  </h3>
                  
                  <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                    {option.description}
                  </p>

                  <div className="flex items-center text-admin-600 dark:text-admin-400 font-semibold group-hover:translate-x-2 transition-transform">
                    Create Account <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="text-admin-600 hover:text-admin-700 font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
