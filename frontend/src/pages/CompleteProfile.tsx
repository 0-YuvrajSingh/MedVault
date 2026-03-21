import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Award, DollarSign, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from '@/utils/toast';
import { Button, Input, Card, Alert, Select, TextArea } from '@/components/ui';
import { doctorAPI } from '@/api';
import logger from '@/utils/logger';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = yup.object({
  specialization:      yup.string().required('Specialization is required'),
  licenseNumber:       yup.string().required('License number is required'),
  qualifications:      yup.string().required('Qualifications are required'),
  experienceYears:     yup.number().min(0, 'Cannot be negative').required('Required'),
  consultationFee:     yup.number().min(0, 'Cannot be negative').required('Required'),
  hospitalAffiliation: yup.string().required('Hospital affiliation is required'),
  bio:                 yup.string().required('Bio is required'),
}).required();

type ProfileForm = yup.InferType<typeof schema>;

const SPECIALIZATIONS = [
  { value: '',                 label: 'Select Specialization' },
  { value: 'Cardiology',       label: 'Cardiology'       },
  { value: 'Dermatology',      label: 'Dermatology'      },
  { value: 'Neurology',        label: 'Neurology'        },
  { value: 'Pediatrics',       label: 'Pediatrics'       },
  { value: 'Orthopedics',      label: 'Orthopedics'      },
  { value: 'General Medicine', label: 'General Medicine' },
  { value: 'Gynecology',       label: 'Gynecology'       },
  { value: 'Psychiatry',       label: 'Psychiatry'       },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompleteProfile() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    setError('');
    try {
      await doctorAPI.createProfile({ ...data, userId: user?.id });
      toast.success('Profile created successfully!');
      navigate('/doctor/dashboard');
    } catch (err: any) {
      logger.error('Profile creation error:', err);
      const msg = err.response?.data?.message ?? err.message ?? 'Failed to create profile';
      setError(msg);
      toast.error('Profile creation failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-violet-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-14 h-14 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mb-4">
            <Stethoscope className="w-7 h-7 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Complete Your Profile</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Provide your professional details to get started</p>
        </div>

        <Card variant="glass" className="backdrop-blur-xl">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <Alert type="error" message={error} onClose={() => setError('')} />
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Select label="Specialization" options={SPECIALIZATIONS}
              error={errors.specialization?.message} {...register('specialization')} />

            <Input label="Medical License Number" type="text" placeholder="MED123456" leftIcon={Award}
              error={errors.licenseNumber?.message} {...register('licenseNumber')} />

            <Input label="Qualifications" type="text" placeholder="MBBS, MD" leftIcon={Award}
              error={errors.qualifications?.message} {...register('qualifications')} />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Years of Experience" type="number" placeholder="5" leftIcon={Stethoscope}
                error={errors.experienceYears?.message} {...register('experienceYears')} />
              <Input label="Consultation Fee (₹)" type="number" placeholder="500" leftIcon={DollarSign}
                error={errors.consultationFee?.message} {...register('consultationFee')} />
            </div>

            <Input label="Hospital Affiliation" type="text" placeholder="City General Hospital" leftIcon={Building2}
              error={errors.hospitalAffiliation?.message} {...register('hospitalAffiliation')} />

            <TextArea label="Bio" placeholder="Tell us about yourself and your practice…"
              error={errors.bio?.message} rows={4} maxLength={255} {...register('bio')} />

            <div className="bg-violet-50 dark:bg-violet-950/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800">
              <p className="text-sm text-violet-700 dark:text-violet-400">
                <strong>Note:</strong> Your profile will be pending admin verification before you can log in.
              </p>
            </div>

            <Button type="submit" variant="primary" loading={isLoading} className="w-full">
              Create Profile
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
