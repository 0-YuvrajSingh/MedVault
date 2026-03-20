import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Button, Input, Card, Alert } from '../components/ui';
import { authAPI, doctorAPI, patientAPI, injectAxiosToken } from '../api';
import logger from '../utils/logger';

// Validation schema
const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
}).required();

const Login = () => {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated() && user?.role) {
      const role = user.role.toLowerCase();
      navigate(`/${role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      // Call backend API to authenticate
      const response = await authAPI.login({
        email: data.email,
        password: data.password
      });

      const apiResponse = response.data;
      if (apiResponse.success && apiResponse.data) {
        const { token, ...userData } = apiResponse.data;
        
        // Manually inject token for immediate use (fixes 403 on doctor profile check)
        injectAxiosToken(token);

        // If doctor, check verification status
        if (userData.role === 'DOCTOR') {
          // Fetch doctor profile by userId
          try {
            const doctorRes = await doctorAPI.getByUser(userData.id);
            const doctor = doctorRes.data?.data;
            // Only block if doctor HAS a profile but is NOT verified
            if (doctor && !doctor.isVerified) {
              setError('Your account is pending admin verification. You cannot log in until approved.');
              toast.error('Login blocked', 'Your account is pending admin verification.');
              setIsLoading(false);
              return;
            }
            // If no profile, allow login - dashboard will redirect to complete-profile
          } catch (err) {
            // If 404, it means no profile exists - allow login, dashboard will handle redirect
            if (err.response?.status !== 404) {
              // For other errors, log but still allow login
              logger.warn('Error checking doctor profile:', err);
            }
          }
        }

        // If patient, fetch and attach patientId
        if (userData.role === 'PATIENT') {
          try {
            const patientRes = await patientAPI.getByUser(userData.id);
            const patient = patientRes.data?.data;
            if (patient && patient.id) {
              userData.patientId = patient.id;
            }
          } catch (err) {
            logger.warn('Error fetching patient profile:', err);
          }
        }

        // Update AuthContext with token and user data
        logger.log('Login debug:', { token, userData });
        login(token, userData);
        toast.success('Welcome back!', 'Login successful');
        // Redirect based on user role
        if (userData.role) {
          const role = userData.role.toLowerCase();
          navigate(`/${role}/dashboard`);
        }
      } else {
        throw new Error(apiResponse.message || 'Login failed');
      }
    } catch (err) {
      logger.error('Login error:', err);
      const status = err.response?.status;
      const data = err.response?.data;
      const detailedMessage = data?.message || err.message;
      const displayMessage = status ? `Error ${status}: ${detailedMessage}` : detailedMessage;
      setError(displayMessage);
      toast.error('Login failed', displayMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-white to-surface dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-patient-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-doctor-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-16 h-16 mx-auto bg-gradient-to-br from-patient-500 to-doctor-500 rounded-2xl flex items-center justify-center shadow-2xl mb-4"
          >
            <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            Please enter your credentials to continue
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-6 md:p-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="rounded-lg">
                {error}
              </Alert>
            )}
            <Input
              label="Email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
              leftIcon={Mail}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={errors.password?.message}
              leftIcon={Lock}
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
            />
            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-patient-600 dark:text-patient-400 hover:underline">
              Forgot your password?
            </Link>
          </div>
        </Card>

        {/* Footer Links */}
        <Card className="mt-6 p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg">
          <div className="text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-patient-600 dark:text-patient-400 font-semibold hover:underline">
                Create an Account
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-6"
        >
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-patient-600 dark:text-patient-400 hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-patient-600 dark:text-patient-400 hover:underline">
            Privacy Policy
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;