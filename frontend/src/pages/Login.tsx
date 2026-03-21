import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button, Input, Card, Alert } from '@/components/ui';
import { authAPI, doctorAPI, patientAPI, injectAxiosToken } from '@/api';
import logger from '@/utils/logger';
import type { User } from '@/types';

// ─── Validation ───────────────────────────────────────────────────────────────

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'At least 6 characters').required('Password is required'),
}).required();

type LoginFormData = yup.InferType<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

const Login: React.FC = () => {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated() && user?.role) {
      navigate(`/${user.role.toLowerCase()}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email: data.email, password: data.password });
      const apiResponse = response.data;

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.message || 'Login failed');
      }

      const { token, ...userData } = apiResponse.data as { token: string } & User;

      // Inject token immediately so subsequent requests are authorized
      injectAxiosToken(token);

      // Doctor: check verification status
      if (userData.role === 'DOCTOR') {
        try {
          const doctorRes = await doctorAPI.getByUser(userData.id);
          const doctor = doctorRes.data?.data;
          if (doctor && !doctor.isVerified) {
            setError('Your account is pending admin verification. You cannot log in until approved.');
            toast.error('Login blocked', 'Account pending verification.');
            return;
          }
        } catch (err: any) {
          // 404 = no profile yet — allow through, dashboard will redirect
          if (err.response?.status !== 404) {
            logger.warn('Error checking doctor profile:', err);
          }
        }
      }

      // Patient: attach patientId to user object
      if (userData.role === 'PATIENT') {
        try {
          const patientRes = await patientAPI.getByUser(userData.id);
          const patient = patientRes.data?.data;
          if (patient?.id) {
            (userData as any).patientId = patient.id;
          }
        } catch (err) {
          logger.warn('Error fetching patient profile:', err);
        }
      }

      login(token, userData);
      toast.success('Welcome back!', 'Logged in successfully.');
      navigate(`/${userData.role.toLowerCase()}/dashboard`, { replace: true });

    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Something went wrong.';
      const display = status ? `${msg}` : msg;
      setError(display);
      toast.error('Login failed', display);
      logger.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-white to-surface dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 p-4">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-emerald-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-xl mb-4">
            <Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Sign in to your MedVault account
          </p>
        </div>

        {/* Form card */}
        <Card className="p-6 md:p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {error && (
              <Alert variant="destructive" className="rounded-xl text-sm">
                {error}
              </Alert>
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                leftIcon={Lock}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(v => !v)}
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="mt-1.5 text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </form>
        </Card>

        {/* Register link */}
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-5">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-neutral-900 dark:text-white hover:underline"
          >
            Create one
          </Link>
        </p>

        {/* Terms */}
        <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-4">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="hover:underline">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
