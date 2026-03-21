import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, CheckCircle } from 'lucide-react';
import { adminAPI } from '@/api';
import { toast } from '@/utils/toast';
import logger from '@/utils/logger';

interface UnverifiedDoctor {
  id:              number;
  name?:           string;
  email?:          string;
  specialization?: string;
  experienceYears?: number;
  consultationFee?: number;
  qualifications?: string;
}

export default function DoctorVerifications() {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<UnverifiedDoctor[]>([]);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUnverifiedDoctors();
      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      logger.error('Failed to load unverified doctors:', err);
      toast.error('Failed to load unverified doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const handleVerify = async (doctorId: number) => {
    try {
      await adminAPI.verifyDoctor(doctorId);
      toast.success('Doctor verified successfully');
      fetchDoctors();
    } catch {
      toast.error('Failed to verify doctor');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <UserCheck className="text-orange-600" size={24} /> Doctor Verifications
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">Review and verify pending doctor registrations</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-2.5 shadow-sm">
          <p className="text-xs text-neutral-500">Pending</p>
          <p className="text-xl font-bold text-orange-600">{doctors.length}</p>
        </div>
      </motion.div>

      <div className="space-y-3">
        {doctors.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
            <p className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">All Caught Up!</p>
            <p className="text-sm text-neutral-500">No pending doctor verifications.</p>
          </motion.div>
        ) : doctors.map((doc, i) => (
          <motion.div key={doc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">{doc.name ?? 'Unknown Doctor'}</h3>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                  <p><span className="font-medium text-neutral-700 dark:text-neutral-300">Email:</span> {doc.email}</p>
                  <p><span className="font-medium text-neutral-700 dark:text-neutral-300">Specialty:</span> {doc.specialization ?? 'Not specified'}</p>
                  <p><span className="font-medium text-neutral-700 dark:text-neutral-300">Experience:</span> {doc.experienceYears ?? 0} years</p>
                  <p><span className="font-medium text-neutral-700 dark:text-neutral-300">Fee:</span> ₹{doc.consultationFee ?? 0}</p>
                  {doc.qualifications && (
                    <p className="sm:col-span-2"><span className="font-medium text-neutral-700 dark:text-neutral-300">Qualifications:</span> {doc.qualifications}</p>
                  )}
                </div>
              </div>
              <button onClick={() => handleVerify(doc.id)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-md transition-all flex-shrink-0">
                <CheckCircle size={16} /> Verify
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
