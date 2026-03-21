import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Mail, Lock, User, Phone, Calendar,
  Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button, Input, Card, Alert, Select } from '@/components/ui';
import StepIndicator from '@/components/ui/StepIndicator';
import { authAPI } from '@/api';
import logger from '@/utils/logger';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = yup.object({
  name:            yup.string().required('Name is required'),
  email:           yup.string().email('Invalid email').required('Email is required'),
  password:        yup.string().min(6, 'At least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Required'),
}).required();

const step2Schema = yup.object({
  phone:       yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').required('Required'),
  dateOfBirth: yup.date().max(new Date(), 'Cannot be in the future').required('Required'),
  gender:      yup.string().required('Gender is required'),
}).required();

type Step1Data = yup.InferType<typeof step1Schema>;
type Step2Data = yup.InferType<typeof step2Schema>;
type AllData   = Partial<Step1Data & Step2Data>;

// ─── Animation ────────────────────────────────────────────────────────────────

const slide = {
  hidden:  { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, staggerChildren: 0.08 } },
  exit:    { opacity: 0, x: -50, transition: { duration: 0.2 } },
};
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const STEPS    = ['Account Info', 'Personal Details', 'Review'];
const GENDERS  = [
  { value: '',       label: 'Select Gender' },
  { value: 'MALE',   label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER',  label: 'Other' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const RegisterPatient: React.FC = () => {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const toast       = useToast();

  const [step,         setStep]        = useState(0);
  const [showPwd,      setShowPwd]     = useState(false);
  const [showCPwd,     setShowCPwd]    = useState(false);
  const [isLoading,    setIsLoading]   = useState(false);
  const [error,        setError]       = useState('');
  const [collected,    setCollected]   = useState<AllData>({});

  const schema = step === 0 ? step1Schema : step2Schema;

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<AllData>({
    resolver: yupResolver(schema as yup.ObjectSchema<AllData>),
    mode: 'onChange',
  });

  const handleNext = async () => {
    if (!await trigger()) return;
    setCollected(prev => ({ ...prev, ...getValues() }));
    setStep(s => s + 1);
    setError('');
  };

  const onSubmit = async (data: AllData) => {
    setIsLoading(true);
    setError('');
    try {
      const final = { ...collected, ...data };
      await authAPI.registerPatient({
        name:        final.name!,
        email:       final.email!,
        password:    final.password!,
        phone:       final.phone!,
        dateOfBirth: new Date(final.dateOfBirth!).toISOString().split('T')[0],
        gender:      final.gender!,
        role:        'PATIENT',
      });
      toast.success('Registration successful!', 'Please log in to continue.');
      navigate('/login');
    } catch (err: any) {
      logger.error('Registration error:', err);
      const msg = err.response?.data?.message ?? err.message ?? 'Registration failed.';
      setError(msg);
      toast.error('Registration failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 p-4 relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 8 }} />
        <motion.div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }} transition={{ repeat: Infinity, duration: 8 }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="w-full max-w-3xl relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/register" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to role selection
          </Link>
          <motion.div whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-14 h-14 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl mb-4">
            <Activity className="w-7 h-7 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Register as Patient</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Create your account to book appointments and manage health records</p>
        </div>

        <StepIndicator steps={STEPS} currentStep={step} role="patient" />

        <Card variant="glass" className="backdrop-blur-xl">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <Alert type="error" message={error} onClose={() => setError('')} />
            </motion.div>
          )}

          <form onSubmit={handleSubmit(step === 2 ? onSubmit : handleNext)}>
            <AnimatePresence mode="wait">
              {/* Step 1 — Account */}
              {step === 0 && (
                <motion.div key="s1" variants={slide} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                  {([
                    { label: 'Full Name',       name: 'name',            type: 'text',     icon: User,     ph: 'John Doe'              },
                    { label: 'Email Address',   name: 'email',           type: 'email',    icon: Mail,     ph: 'john@example.com'      },
                    { label: 'Password',        name: 'password',        type: showPwd  ? 'text' : 'password', icon: Lock, ph: '••••••••',
                      rightIcon: showPwd  ? EyeOff : Eye, onRight: () => setShowPwd(v => !v) },
                    { label: 'Confirm Password',name: 'confirmPassword', type: showCPwd ? 'text' : 'password', icon: Lock, ph: '••••••••',
                      rightIcon: showCPwd ? EyeOff : Eye, onRight: () => setShowCPwd(v => !v) },
                  ] as const).map(f => (
                    <motion.div key={f.name} variants={item}>
                      <Input label={f.label} type={f.type} placeholder={f.ph} leftIcon={f.icon}
                        rightIcon={'rightIcon' in f ? f.rightIcon : undefined}
                        onRightIconClick={'onRight' in f ? f.onRight : undefined}
                        error={(errors as Record<string, { message?: string }>)[f.name]?.message}
                        {...register(f.name as keyof AllData)} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Step 2 — Personal */}
              {step === 1 && (
                <motion.div key="s2" variants={slide} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                  <motion.div variants={item}>
                    <Input label="Phone Number" type="tel" placeholder="1234567890" leftIcon={Phone}
                      error={errors.phone?.message} {...register('phone')} />
                  </motion.div>
                  <motion.div variants={item}>
                    <Input label="Date of Birth" type="date" leftIcon={Calendar}
                      error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
                  </motion.div>
                  <motion.div variants={item}>
                    <Select label="Gender" options={GENDERS} leftIcon={User}
                      error={errors.gender?.message} {...register('gender')} />
                  </motion.div>
                </motion.div>
              )}

              {/* Step 3 — Review */}
              {step === 2 && (
                <motion.div key="s3" variants={slide} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                  <div className="text-center mb-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                      className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-7 h-7 text-emerald-600" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">Review your information</h3>
                    <p className="text-sm text-neutral-500">Please verify before submitting</p>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-5 space-y-3">
                    {([
                      { label: 'Name',          value: collected.name },
                      { label: 'Email',         value: collected.email },
                      { label: 'Phone',         value: collected.phone },
                      { label: 'Date of Birth', value: collected.dateOfBirth ? new Date(collected.dateOfBirth).toLocaleDateString() : '' },
                      { label: 'Gender',        value: collected.gender },
                    ]).map(row => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-neutral-500">{row.label}</span>
                        <span className="font-medium text-neutral-900 dark:text-white">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} disabled={isLoading} leftIcon={ArrowLeft} className="flex-1">
                  Back
                </Button>
              )}
              <Button type="submit" variant="primary" loading={isLoading}
                rightIcon={step === 2 ? CheckCircle : ArrowRight} className="flex-1">
                {step === 2 ? 'Create Account' : 'Continue'}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:underline">Sign in</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPatient;
