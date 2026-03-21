// @ts-nocheck
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Mail, Lock, User, Phone, Calendar, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Button, Input, Card, Alert, Select } from '../components/ui';
import StepIndicator from '../components/ui/StepIndicator';
import { authAPI } from '../api';
import logger from '../utils/logger';

// Step-specific validation schemas
const step1Schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
});

const step2Schema = yup.object({
  phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Phone is required'),
  dateOfBirth: yup.date().max(new Date(), 'Date of birth cannot be in the future').required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
});

const RegisterPatient = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});

  const steps = ['Account Info', 'Personal Details', 'Review'];

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm({
    resolver: yupResolver(currentStep === 0 ? step1Schema : step2Schema),
    mode: 'onChange',
  });

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      const values = getValues();
      setFormData({ ...formData, ...values });
      setCurrentStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const finalData = { ...formData, ...data };
      const payload = {
        name: finalData.name,
        email: finalData.email,
        password: finalData.password,
        phone: finalData.phone,
        dateOfBirth: new Date(finalData.dateOfBirth).toISOString().split('T')[0],
        gender: finalData.gender,
        role: 'PATIENT',
      };

      await authAPI.registerPatient(payload);
      
      toast.success('Registration successful!', 'Please login to continue');
      navigate('/login');
    } catch (err) {
      logger.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error('Registration failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, staggerChildren: 0.1 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-patient-50 via-white to-patient-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-patient-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-patient-600/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/register" className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-patient-600 dark:hover:text-patient-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to role selection
          </Link>
          
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-16 h-16 mx-auto bg-gradient-to-br from-patient-500 to-patient-600 rounded-2xl flex items-center justify-center shadow-2xl mb-4"
          >
            <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Register as Patient
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Create your account to book appointments and manage health records
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} role="patient" />

        {/* Form Card */}
        <Card variant="glass" className="backdrop-blur-xl">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert type="error" message={error} onClose={() => setError('')} />
            </motion.div>
          )}

          <form onSubmit={handleSubmit(currentStep === 2 ? onSubmit : handleNext)}>
            <AnimatePresence mode="wait">
              {/* Step 1: Account Info */}
              {currentStep === 0 && (
                <motion.div
                  key="step1"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible" exit="exit"
                  className="space-y-5"
                >
                  <motion.div variants={itemVariants}>
                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="John Doe"
                      leftIcon={User}
                      error={errors.name?.message}
                      {...register('name')}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john.doe@example.com"
                      leftIcon={Mail}
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      leftIcon={Lock}
                      error={errors.password?.message}
                      {...register('password')}
                      rightIcon={showPassword ? EyeOff : Eye}
                      onRightIconClick={() => setShowPassword(!showPassword)}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Input
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      leftIcon={Lock}
                      error={errors.confirmPassword?.message}
                      {...register('confirmPassword')}
                      rightIcon={showConfirmPassword ? EyeOff : Eye}
                      onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </motion.div>
                </motion.div>
              )}

              {/* Step 2: Personal Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-5"
                >
                  <motion.div variants={itemVariants}>
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="1234567890"
                      leftIcon={Phone}
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Input
                      label="Date of Birth"
                      type="date"
                      leftIcon={Calendar}
                      error={errors.dateOfBirth?.message}
                      {...register('dateOfBirth')}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Select
                      label="Gender"
                      options={genderOptions}
                      leftIcon={User}
                      error={errors.gender?.message}
                      {...register('gender')}
                    />
                  </motion.div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {currentStep === 2 && (
                <motion.div
                  key="step3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="w-16 h-16 bg-patient-100 dark:bg-patient-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-8 h-8 text-patient-600" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                      Review Your Information
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Please review your details before submitting
                    </p>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Name:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Email:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Phone:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Date of Birth:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Gender:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{formData.gender}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  leftIcon={ArrowLeft}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                rightIcon={currentStep === 2 ? CheckCircle : ArrowRight}
                className="flex-1"
              >
                {currentStep === 2 ? 'Create Account' : 'Continue'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="text-patient-600 hover:text-patient-700 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPatient;
