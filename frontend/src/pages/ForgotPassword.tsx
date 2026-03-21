// @ts-nocheck
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, Card, Alert } from '../components/ui';

// Validation schema
const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
}).required();

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      // TODO: Implement actual password reset API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful response
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
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
        {/* Back to Login Link */}
        <Link 
          to="/login"
          className="inline-flex items-center gap-2 text-patient-600 dark:text-patient-400 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                Forgot Password?
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                No worries! Enter your email and we'll send you reset instructions.
              </p>
            </div>

            {/* Reset Form Card */}
            <Card variant="premium" className="p-8">
              {error && (
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError('')}
                  className="mb-6"
                />
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={Mail}
                  error={errors.email?.message}
                  fullWidth
                  {...register('email')}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                >
                  Send Reset Link
                </Button>
              </form>
            </Card>
          </>
        ) : (
          <>
            {/* Success State */}
            <Card variant="premium" className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                Check Your Email
              </h2>
              
              <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                We've sent password reset instructions to:
              </p>
              
              <p className="text-lg font-semibold text-patient-600 dark:text-patient-400 mb-6">
                {getValues('email')}
              </p>
              
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
                If you don't receive an email within a few minutes, please check your spam folder.
              </p>

              <Link to="/login">
                <Button variant="outline" fullWidth>
                  Return to Login
                </Button>
              </Link>
            </Card>
          </>
        )}

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-6"
        >
          Remember your password?{' '}
          <Link to="/login" className="text-patient-600 dark:text-patient-400 hover:underline font-medium">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
