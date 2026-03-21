import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Activity } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, Card, Alert } from '@/components/ui';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = yup.object({ email: yup.string().email('Invalid email').required('Email is required') }).required();
type FormData = yup.InferType<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState('');

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (_data: FormData) => {
    setIsLoading(true);
    setError('');
    try {
      // TODO: wire to authAPI.forgotPassword(_data.email)
      await new Promise<void>(res => setTimeout(res, 1200));
      setIsSubmitted(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 p-4 relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10">

        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        {!isSubmitted ? (
          <>
            {/* Logo + header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-emerald-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-xl mb-4">
                <Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Forgot password?</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Enter your email and we'll send you reset instructions.
              </p>
            </div>

            <Card className="p-6 md:p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800">
              {error && <Alert variant="destructive" className="mb-4 rounded-xl text-sm">{error}</Alert>}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  leftIcon={Mail}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading}>
                  Send Reset Link
                </Button>
              </form>
            </Card>
          </>
        ) : (
          /* Success state */
          <Card className="p-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </motion.div>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Check your email</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">We've sent reset instructions to:</p>
            <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mb-4">{getValues('email')}</p>
            <p className="text-xs text-neutral-400 mb-7">
              Didn't get it? Check your spam folder or wait a few minutes.
            </p>

            <Link to="/login">
              <Button variant="outline" className="w-full">Return to Login</Button>
            </Link>
          </Card>
        )}

        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-5">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-neutral-900 dark:text-white hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
