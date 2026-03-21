// @ts-nocheck
import React, { useState } from 'react';
import { doctorAPI } from '../../api';
import { toast } from '../../utils/toast';

export default function CreateProfileForm({ doctorUser, onClose, onSuccess }) {
    // Common specializations for dropdown
    const specializations = [
      '',
      'Cardiology',
      'Dermatology',
      'Endocrinology',
      'Gastroenterology',
      'Neurology',
      'Oncology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Radiology',
      'Urology',
      'General Medicine',
      'Other',
    ];
  const [form, setForm] = useState({
    specialization: '',
    specializationCustom: '',
    licenseNumber: '',
    qualifications: '',
    hospitalAffiliation: '',
    bio: '',
    experienceYears: '',
    consultationFee: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'specialization') {
      setForm((prev) => ({
        ...prev,
        specialization: value,
        specializationCustom: '',
      }));
    } else if (name === 'specializationCustom') {
      setForm((prev) => ({
        ...prev,
        specializationCustom: value,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const specializationToSend =
        form.specialization === 'Other' && form.specializationCustom
          ? form.specializationCustom
          : form.specialization;
      await doctorAPI.create({
        userId: doctorUser.id,
        specialization: specializationToSend,
        licenseNumber: form.licenseNumber,
        qualifications: form.qualifications,
        hospitalAffiliation: form.hospitalAffiliation,
        bio: form.bio,
        experienceYears: Number(form.experienceYears),
        consultationFee: Number(form.consultationFee),
      });
      toast.success('Doctor profile created successfully');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="p-6 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input type="text" value={doctorUser.name} disabled className="w-full px-3 py-2 border rounded bg-gray-100" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={doctorUser.email} disabled className="w-full px-3 py-2 border rounded bg-gray-100" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
        <select
          name="specialization"
          value={form.specialization}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded mb-2"
        >
          {specializations.map((spec) => (
            <option key={spec} value={spec} disabled={spec === ''}>
              {spec === '' ? 'Select specialization' : spec}
            </option>
          ))}
        </select>
        {/* Allow custom specialization if 'Other' is selected */}
        {form.specialization === 'Other' && (
          <input
            name="specializationCustom"
            placeholder="Enter specialization"
            value={form.specializationCustom}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mt-1"
            autoFocus
          />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
        <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
        <input name="qualifications" value={form.qualifications} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Affiliation</label>
        <input name="hospitalAffiliation" value={form.hospitalAffiliation} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} required className="w-full px-3 py-2 border rounded" rows={2} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
        <input name="experienceYears" type="number" min="0" value={form.experienceYears} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($)</label>
        <input name="consultationFee" type="number" min="0" value={form.consultationFee} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Creating...' : 'Create Profile'}
        </button>
      </div>
    </form>
  );
}
