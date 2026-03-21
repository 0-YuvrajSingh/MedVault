import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doctorAPI, fileAPI } from '@/api';
import { toast } from '@/utils/toast';
import logger from '@/utils/logger';
import {
  User, Mail, Phone, MapPin, Briefcase, Award,
  Calendar, Edit, Save, X, Camera,
} from 'lucide-react';
import type { Doctor } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DoctorDetail extends Doctor {
  hospitalAffiliation?: string;
  licenseNumber?: string;
  experienceYears?: number;
  consultationFee?: number;
  bio?: string;
  profilePicture?: string;
  isVerified?: boolean;
  registrationNumber?: string;
}

interface ProfileForm {
  specialization:     string;
  qualifications:     string;
  experienceYears:    string;
  hospitalAffiliation:string;
  licenseNumber:      string;
  phone:              string;
  consultationFee:    string;
  bio:                string;
}

function toForm(d: DoctorDetail): ProfileForm {
  return {
    specialization:      d.specialization         ?? '',
    qualifications:      d.qualification           ?? '',
    experienceYears:     String(d.experienceYears  ?? ''),
    hospitalAffiliation: d.hospitalAffiliation     ?? '',
    licenseNumber:       d.licenseNumber           ?? '',
    phone:               d.phone                   ?? '',
    consultationFee:     String(d.consultationFee  ?? ''),
    bio:                 d.bio                     ?? '',
  };
}

// ─── Sub-component ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  editing: boolean;
  value: string;
  display: string;
  name: keyof ProfileForm;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function ProfileField({ label, icon, editing, value, display, name, type = 'text', placeholder, multiline, onChange }: FieldProps) {
  const inputCls = 'w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
        {icon} {label}
      </label>
      {editing
        ? multiline
          ? <textarea name={name} value={value} onChange={onChange} rows={3} placeholder={placeholder} className={inputCls} />
          : <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={inputCls} />
        : <p className="text-sm font-semibold text-neutral-900 dark:text-white">{display || 'Not specified'}</p>
      }
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DoctorProfile() {
  const { user } = useAuth();
  const [doctor,    setDoctor]    = useState<DoctorDetail | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData,  setFormData]  = useState<ProfileForm>({
    specialization: '', qualifications: '', experienceYears: '',
    hospitalAffiliation: '', licenseNumber: '', phone: '',
    consultationFee: '', bio: '',
  });

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await doctorAPI.getByUser(user.id);
      if (res.data.success) {
        const d: DoctorDetail = res.data.data;
        setDoctor(d);
        setFormData(toForm(d));
      }
    } catch (err: any) {
      if (err.response?.status !== 404) logger.error('Failed to load doctor profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!doctor) return;
    try {
      const res = await doctorAPI.update(doctor.id, { ...formData, userId: user!.id });
      if (res.data.success) { toast.success('Profile updated'); setEditing(false); fetchProfile(); }
    } catch { toast.error('Failed to update profile'); }
  };

  const handleCancel = () => {
    setEditing(false);
    if (doctor) setFormData(toForm(doctor));
  };

  const handlePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    try {
      setUploading(true);
      const res = await fileAPI.uploadProfilePicture(file, user!.id);
      if (res.data.success) { toast.success('Profile picture updated'); fetchProfile(); }
    } catch { toast.error('Failed to upload picture'); }
    finally { setUploading(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  if (!doctor) return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 text-center">
      <p className="text-yellow-800 dark:text-yellow-400">Doctor profile not found. Please contact support.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Profile</h1>
        {!editing
          ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Edit size={16} /> Edit Profile
            </button>
          )
          : (
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                <Save size={16} /> Save
              </button>
              <button onClick={handleCancel} className="flex items-center gap-2 bg-neutral-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-neutral-600 transition-colors">
                <X size={16} /> Cancel
              </button>
            </div>
          )
        }
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                {doctor.profilePicture
                  ? <img src={doctor.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  : <User className="text-blue-600" size={52} />
                }
              </div>
              <label className="absolute -bottom-1 -right-1 bg-white rounded-xl p-1.5 cursor-pointer shadow-lg hover:bg-neutral-50 transition-colors">
                <Camera className="text-blue-600" size={16} />
                <input type="file" accept="image/*" onChange={handlePicture} className="hidden" disabled={uploading} />
              </label>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white" />
                </div>
              )}
            </div>

            <div className="text-white">
              <h2 className="text-2xl font-bold mb-0.5">{user?.name}</h2>
              <p className="text-blue-100 mb-2">{doctor.specialization}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                doctor.isVerified
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-400 text-yellow-900'
              }`}>
                <Award size={12} className="inline mr-1" />
                {doctor.isVerified ? 'Verified Doctor' : 'Pending Verification'}
              </span>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <ProfileField label="Specialization"    icon={<Briefcase size={14} />} editing={editing} name="specialization"      value={formData.specialization}      display={doctor.specialization}              placeholder="e.g. Cardiologist"  onChange={handleChange} />
          <ProfileField label="Qualifications"    icon={<Award size={14} />}     editing={editing} name="qualifications"      value={formData.qualifications}      display={doctor.qualification}               placeholder="e.g. MBBS, MD"      onChange={handleChange} />
          <ProfileField label="License Number"    icon={<Award size={14} />}     editing={editing} name="licenseNumber"       value={formData.licenseNumber}       display={doctor.licenseNumber ?? ''}         placeholder="e.g. LIC-12345"     onChange={handleChange} />
          <ProfileField label="Experience (yrs)"  icon={<Calendar size={14} />}  editing={editing} name="experienceYears"     value={formData.experienceYears}     display={doctor.experienceYears ? `${doctor.experienceYears} years` : ''} placeholder="e.g. 10" type="number" onChange={handleChange} />
          <ProfileField label="Phone"             icon={<Phone size={14} />}     editing={editing} name="phone"               value={formData.phone}               display={doctor.phone ?? ''}                 placeholder="+91 …"              onChange={handleChange} />
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5"><Mail size={14} /> Email</label>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{user?.email}</p>
          </div>
          <ProfileField label="Consultation Fee (₹)" icon={<Briefcase size={14} />} editing={editing} name="consultationFee" value={formData.consultationFee} display={doctor.consultationFee ? `₹${doctor.consultationFee}` : ''} placeholder="e.g. 500" type="number" onChange={handleChange} />
        </div>

        {/* Wide fields */}
        <div className="px-6 pb-6 space-y-5">
          <ProfileField label="Hospital Affiliation" icon={<MapPin size={14} />} editing={editing} name="hospitalAffiliation" value={formData.hospitalAffiliation} display={doctor.hospitalAffiliation ?? ''} placeholder="Enter hospital" multiline onChange={handleChange} />
          <ProfileField label="Bio"                  icon={<User size={14} />}   editing={editing} name="bio"                 value={formData.bio}                 display={doctor.bio ?? 'No bio added yet'}  placeholder="About yourself…"  multiline onChange={handleChange} />
        </div>

        {/* Footer info */}
        <div className="bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 px-6 py-5">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              { label: 'Registration Number', value: doctor.registrationNumber ?? 'N/A' },
              { label: 'User ID',             value: String(user?.id) },
              { label: 'Account Status',      value: 'Active' },
            ]).map(i => (
              <div key={i.label} className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                <p className="text-xs text-neutral-500 mb-1">{i.label}</p>
                <p className="font-semibold text-neutral-900 dark:text-white text-sm">{i.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
