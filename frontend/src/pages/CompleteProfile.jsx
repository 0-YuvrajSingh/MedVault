import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Award, DollarSign, Building2, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from '../utils/toast';
import { Button, Input, Card, Alert, Select, TextArea } from '../components/ui';
import { doctorAPI } from '../api';
import logger from '../utils/logger';
import Navbar from '../components/Navbar';

const profileSchema = yup.object({
  specialization: yup.string().required('Specialization is required'),
  licenseNumber: yup.string().required('License number is required'),
  qualifications: yup.string().required('Qualifications are required'),
  experienceYears: yup.number().min(0, 'Experience cannot be negative').required('Experience is required'),
  consultationFee: yup.number().min(0, 'Fee cannot be negative').required('Consultation fee is required'),
  hospitalAffiliation: yup.string().required('Hospital affiliation is required'),
  bio: yup.string().required('Bio is required'),
});

export default function CompleteProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(profileSchema),
    mode: 'onChange',
  });

  const specializationOptions = [
    { value: '', label: 'Select Specialization' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'Neurology', label: 'Neurology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'General Medicine', label: 'General Medicine' },
    { value: 'Gynecology', label: 'Gynecology' },
    { value: 'Psychiatry', label: 'Psychiatry' },
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      await doctorAPI.createProfile({ ...data, userId: user?.id });
      toast.success('Profile created successfully!');
      navigate('/doctor/dashboard');
    } catch (err) {
      logger.error('Profile creation error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create profile';
      setError(errorMessage);
      toast.error('Profile creation failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-doctor-50 via-white to-doctor-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-16 h-16 mx-auto bg-gradient-to-br from-doctor-500 to-doctor-600 rounded-2xl flex items-center justify-center shadow-2xl mb-4"
            >
              <Stethoscope className="w-8 h-8 text-white" strokeWidth={2.5} />
            </motion.div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-neutral-600">
              Please provide your professional details to get started
            </p>
          </div>

          {/* Form Card */}
          <Card variant="glass" className="backdrop-blur-xl">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Alert type="error" message={error} onClose={() => setError('')} />
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Select
                label="Specialization"
                options={specializationOptions}
                error={errors.specialization?.message}
                {...register('specialization')}
              />

              <Input
                label="Medical License Number"
                type="text"
                placeholder="MED123456"
                leftIcon={Award}
                error={errors.licenseNumber?.message}
                {...register('licenseNumber')}
              />

              <Input
                label="Qualifications"
                type="text"
                placeholder="MBBS, MD"
                leftIcon={Award}
                error={errors.qualifications?.message}
                {...register('qualifications')}
              />

              <Input
                label="Years of Experience"
                type="number"
                placeholder="5"
                leftIcon={Stethoscope}
                error={errors.experienceYears?.message}
                {...register('experienceYears')}
              />

              <Input
                label="Hospital Affiliation"
                type="text"
                placeholder="City General Hospital"
                leftIcon={Building2}
                error={errors.hospitalAffiliation?.message}
                {...register('hospitalAffiliation')}
              />

              <Input
                label="Consultation Fee (₹)"
                type="number"
                placeholder="500"
                leftIcon={DollarSign}
                error={errors.consultationFee?.message}
                {...register('consultationFee')}
              />

              <TextArea
                label="Bio"
                placeholder="Tell us about yourself and your medical practice..."
                error={errors.bio?.message}
                rows={4}
                maxLength={255}
                {...register('bio')}
              />

              <div className="bg-doctor-50 rounded-xl p-4 border border-doctor-200">
                <p className="text-sm text-doctor-700">
                  <strong>Note:</strong> Your profile will be pending verification by an admin. You will be notified once verified.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                className="w-full"
              >
                Create Profile
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
