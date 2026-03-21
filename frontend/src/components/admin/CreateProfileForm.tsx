import React, { useState } from 'react';
import { doctorAPI } from '@/api';
import { toast } from '@/utils/toast';
import type { User } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileForm {
  specialization:      string;
  specializationCustom: string;
  licenseNumber:       string;
  qualifications:      string;
  hospitalAffiliation: string;
  bio:                 string;
  experienceYears:     string;
  consultationFee:     string;
}

interface Props {
  doctorUser: User;
  onClose:    () => void;
  onSuccess?: () => void;
}

const SPECIALIZATIONS = [
  '', 'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
  'Radiology', 'Urology', 'General Medicine', 'Other',
];

const DEFAULT_FORM: ProfileForm = {
  specialization: '', specializationCustom: '', licenseNumber: '',
  qualifications: '', hospitalAffiliation: '', bio: '',
  experienceYears: '', consultationFee: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateProfileForm({ doctorUser, onClose, onSuccess }: Props) {
  const [form, setForm]       = useState<ProfileForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'specialization' ? { specializationCustom: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const specialization = form.specialization === 'Other' && form.specializationCustom
        ? form.specializationCustom
        : form.specialization;
      await doctorAPI.create({
        userId:             doctorUser.id,
        specialization,
        licenseNumber:      form.licenseNumber,
        qualifications:     form.qualifications,
        hospitalAffiliation: form.hospitalAffiliation,
        bio:                form.bio,
        experienceYears:    Number(form.experienceYears),
        consultationFee:    Number(form.consultationFee),
      });
      toast.success('Doctor profile created successfully');
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-orange-500';
  const labelCls = 'block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5';

  return (
    <form className="p-5 space-y-4" onSubmit={handleSubmit}>
      {/* Read-only user info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Name</label>
          <input type="text" value={doctorUser.name} disabled className={`${inputCls} opacity-60`} />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" value={doctorUser.email} disabled className={`${inputCls} opacity-60`} />
        </div>
      </div>

      {/* Specialization */}
      <div>
        <label className={labelCls}>Specialization</label>
        <select name="specialization" value={form.specialization} onChange={handleChange} required className={inputCls}>
          {SPECIALIZATIONS.map(s => (
            <option key={s} value={s} disabled={s === ''}>{s === '' ? 'Select specialization' : s}</option>
          ))}
        </select>
        {form.specialization === 'Other' && (
          <input name="specializationCustom" value={form.specializationCustom} onChange={handleChange}
            placeholder="Enter specialization" className={`${inputCls} mt-2`} autoFocus />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>License Number</label>
          <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Qualifications</label>
          <input name="qualifications" value={form.qualifications} onChange={handleChange} required className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Hospital Affiliation</label>
        <input name="hospitalAffiliation" value={form.hospitalAffiliation} onChange={handleChange} required className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Bio</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} required rows={2} className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Experience (years)</label>
          <input name="experienceYears" type="number" min="0" value={form.experienceYears} onChange={handleChange} required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Consultation Fee (₹)</label>
          <input name="consultationFee" type="number" min="0" value={form.consultationFee} onChange={handleChange} required className={inputCls} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-300 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 transition-colors">
          {loading ? 'Creating…' : 'Create Profile'}
        </button>
      </div>
    </form>
  );
}
