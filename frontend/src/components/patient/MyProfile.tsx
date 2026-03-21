import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { patientAPI, fileAPI } from '@/api';
import { toast } from '@/utils/toast';
import logger from '@/utils/logger';
import {
  User, Edit, Save, Camera, Mail,
  ChevronDown, ChevronUp, UserCircle, Activity, HeartPulse,
  Utensils, Bed, Dumbbell, Brain, Droplet, Scale, Thermometer
} from 'lucide-react';

interface Lifestyle {
  smoking: string; alcohol: string; diet: string;
  sleepHours: number | string; physicalActivity: string; stressLevel: string;
}
interface CurrentHealth {
  height: string; weight: string; bmi: string;
  bloodPressure: string; pulse: string; temperature: string; bloodSugar: string;
}
interface FormData {
  name: string; email: string; phone: string; address: string;
  bloodGroup: string; dateOfBirth: string; gender: string;
  emergencyContact: string; allergies: string; medicalHistory: string;
  maritalStatus: string; patientId: string; aadhaarNumber: string;
  profilePicture: string; lifestyle: Lifestyle; currentHealth: CurrentHealth;
}
interface Profile { id: number; name: string; email: string; profilePicture?: string; }
type SectionKey = 'basicInfo' | 'identification' | 'lifestyle' | 'currentHealth';

const DEFAULT_LIFESTYLE: Lifestyle = {
  smoking: 'NO', alcohol: 'NO', diet: 'VEG',
  sleepHours: 7, physicalActivity: 'MODERATE', stressLevel: 'MEDIUM',
};
const DEFAULT_HEALTH: CurrentHealth = {
  height: '', weight: '', bmi: '', bloodPressure: '', pulse: '', temperature: '', bloodSugar: '',
};
const DEFAULT_FORM: FormData = {
  name: '', email: '', phone: '', address: '', bloodGroup: '', dateOfBirth: '',
  gender: '', emergencyContact: '', allergies: '', medicalHistory: '',
  maritalStatus: '', patientId: '', aadhaarNumber: '', profilePicture: '',
  lifestyle: DEFAULT_LIFESTYLE, currentHealth: DEFAULT_HEALTH,
};

const getBMICategory = (bmi: string) => {
  const v = parseFloat(bmi);
  if (v < 18.5) return { text: 'Underweight', color: 'text-amber-600' };
  if (v < 25)   return { text: 'Normal',      color: 'text-emerald-600' };
  if (v < 30)   return { text: 'Overweight',  color: 'text-orange-600' };
  return               { text: 'Obese',       color: 'text-red-600' };
};

const inputCls = (disabled: boolean) =>
  `w-full px-4 py-2.5 border rounded-xl text-sm transition-all outline-none ${
    disabled
      ? 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500'
      : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
  }`;

const Section: React.FC<{
  icon: React.ReactNode; title: string; expanded: boolean;
  onToggle: () => void; children: React.ReactNode; delay?: number;
}> = ({ icon, title, expanded, onToggle, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
  >
    <button onClick={onToggle} className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
      <div className="flex items-center gap-3">{icon}<h2 className="font-semibold text-neutral-900 dark:text-white">{title}</h2></div>
      {expanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
    </button>
    {expanded && <div className="px-6 pb-6">{children}</div>}
  </motion.div>
);

export default function MyProfile() {
  const { user } = useAuth();
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [formData, setFormData]   = useState<FormData>(DEFAULT_FORM);
  const [expanded, setExpanded]   = useState<Record<SectionKey, boolean>>({
    basicInfo: true, identification: true, lifestyle: false, currentHealth: false,
  });

  const toggle = (k: SectionKey) => setExpanded(p => ({ ...p, [k]: !p[k] }));

  useEffect(() => {
    const { height, weight } = formData.currentHealth;
    if (!height || !weight) return;
    const h = parseFloat(height) / 100, w = parseFloat(weight);
    if (h > 0 && w > 0)
      setFormData(p => ({ ...p, currentHealth: { ...p.currentHealth, bmi: (w / (h * h)).toFixed(1) } }));
  }, [formData.currentHealth.height, formData.currentHealth.weight]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await patientAPI.getByUser(user!.id);
      const data = res.data?.data;
      if (!data) return;
      setProfile(data);
      let lifestyle: Partial<Lifestyle> = {};
      let currentHealth: Partial<CurrentHealth> = {};
      try { lifestyle = data.lifestyle ? JSON.parse(data.lifestyle) : {}; } catch { /**/ }
      try { currentHealth = data.currentHealth ? JSON.parse(data.currentHealth) : {}; } catch { /**/ }
      setFormData({
        name: data.name ?? '', email: data.email ?? '', phone: data.phone ?? data.phoneNumber ?? '',
        address: data.address ?? '', bloodGroup: data.bloodGroup ?? '', dateOfBirth: data.dateOfBirth ?? '',
        gender: data.gender ?? '', emergencyContact: data.emergencyContact ?? data.emergencyContactPhone ?? '',
        allergies: data.allergies ?? '', medicalHistory: data.medicalHistory ?? '',
        maritalStatus: data.maritalStatus ?? '', patientId: data.patientId ?? '',
        aadhaarNumber: data.aadhaarNumber ?? '', profilePicture: data.profilePicture ?? '',
        lifestyle: { ...DEFAULT_LIFESTYLE, ...lifestyle },
        currentHealth: { ...DEFAULT_HEALTH, ...currentHealth },
      });
    } catch (err) { logger.error('Profile load error:', err); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    try {
      await patientAPI.update(profile.id, {
        ...formData, userId: user!.id, phoneNumber: formData.phone,
        emergencyContactPhone: formData.emergencyContact,
        lifestyle: JSON.stringify(formData.lifestyle),
        currentHealth: JSON.stringify(formData.currentHealth),
      });
      toast.success('Profile updated!');
      setIsEditing(false);
      fetchProfile();
    } catch (err) { logger.error('Update error:', err); toast.error('Failed to update'); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    try {
      await fileAPI.uploadProfilePicture(file, user!.id);
      toast.success('Picture updated!');
      setTimeout(() => fetchProfile(), 500);
    } catch { toast.error('Upload failed'); }
  };

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setFormData(p => ({ ...p, [k]: v }));
  const setL = (k: keyof Lifestyle, v: string | number) => setFormData(p => ({ ...p, lifestyle: { ...p.lifestyle, [k]: v } }));
  const setH = (k: keyof CurrentHealth, v: string) => setFormData(p => ({ ...p, currentHealth: { ...p.currentHealth, [k]: v } }));

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent" />
    </div>
  );

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {profile?.profilePicture
                ? <img src={profile.profilePicture} alt="Profile" className="w-20 h-20 rounded-2xl object-cover border-2 border-neutral-200 dark:border-neutral-700" />
                : <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl font-bold text-white">{profile?.name?.[0] ?? 'P'}</div>
              }
              <label className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white p-1.5 rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors shadow-md">
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{profile?.name}</h1>
              <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-0.5"><Mail className="w-3.5 h-3.5" />{profile?.email}</p>
              {formData.patientId && <p className="text-xs text-emerald-600 font-mono mt-1">ID: {formData.patientId}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button type="button" onClick={() => { setIsEditing(false); fetchProfile(); }} className="px-4 py-2 text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 transition-colors">Cancel</button>
                <button type="submit" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"><Save className="w-4 h-4" />Save</button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl hover:opacity-90 transition-opacity shadow-sm"><Edit className="w-4 h-4" />Edit Profile</button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Basic Info */}
      <Section icon={<User className="w-5 h-5 text-emerald-600" />} title="Basic Information" expanded={expanded.basicInfo} onToggle={() => toggle('basicInfo')} delay={0.05}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-1">
          {(['name','phone','dateOfBirth','emergencyContact'] as const).map(k => (
            <div key={k}>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                {k === 'name' ? 'Full Name' : k === 'phone' ? 'Phone' : k === 'dateOfBirth' ? 'Date of Birth' : 'Emergency Contact'}
              </label>
              <input type={k === 'dateOfBirth' ? 'date' : k === 'phone' || k === 'emergencyContact' ? 'tel' : 'text'}
                value={formData[k]} onChange={e => set(k, e.target.value)} disabled={!isEditing} className={inputCls(!isEditing)} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Email</label>
            <input type="email" value={formData.email} disabled className={inputCls(true)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Blood Group</label>
            <select value={formData.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} disabled={!isEditing} className={inputCls(!isEditing)}>
              <option value="">Select</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Gender</label>
            <select value={formData.gender} onChange={e => set('gender', e.target.value)} disabled={!isEditing} className={inputCls(!isEditing)}>
              <option value="">Select</option>
              <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Marital Status</label>
            <select value={formData.maritalStatus} onChange={e => set('maritalStatus', e.target.value)} disabled={!isEditing} className={inputCls(!isEditing)}>
              <option value="">Select</option>
              <option value="SINGLE">Single</option><option value="MARRIED">Married</option>
              <option value="DIVORCED">Divorced</option><option value="WIDOWED">Widowed</option>
            </select>
          </div>
          {(['address','allergies','medicalHistory'] as const).map(k => (
            <div key={k} className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                {k === 'address' ? 'Address' : k === 'allergies' ? 'Known Allergies' : 'Medical History'}
              </label>
              <textarea value={formData[k]} onChange={e => set(k, e.target.value)} disabled={!isEditing}
                rows={k === 'medicalHistory' ? 3 : 2}
                placeholder={k === 'allergies' ? 'e.g., Penicillin, Peanuts...' : k === 'medicalHistory' ? 'Previous illnesses, surgeries...' : ''}
                className={inputCls(!isEditing) + ' resize-none'} />
            </div>
          ))}
        </div>
      </Section>

      {/* Identification */}
      <Section icon={<UserCircle className="w-5 h-5 text-violet-600" />} title="Identification" expanded={expanded.identification} onToggle={() => toggle('identification')} delay={0.1}>
        <div className="grid md:grid-cols-2 gap-4 mt-1">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Patient ID</label>
            <input type="text" value={formData.patientId} disabled className={inputCls(true) + ' font-mono'} />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">Aadhaar Number</label>
            <input type="text" value={formData.aadhaarNumber} onChange={e => set('aadhaarNumber', e.target.value)} disabled={!isEditing} placeholder="XXXX-XXXX-XXXX" className={inputCls(!isEditing)} />
          </div>
        </div>
      </Section>

      {/* Lifestyle */}
      <Section icon={<Activity className="w-5 h-5 text-emerald-600" />} title="Lifestyle Information" expanded={expanded.lifestyle} onToggle={() => toggle('lifestyle')} delay={0.15}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-1">
          {([
            ['smoking','Smoking',<Droplet className="w-3.5 h-3.5"/>,[['NO','No'],['OCCASIONALLY','Occasionally'],['REGULARLY','Regularly']]],
            ['alcohol','Alcohol',<Droplet className="w-3.5 h-3.5"/>,[['NO','No'],['OCCASIONALLY','Occasionally'],['REGULARLY','Regularly']]],
            ['diet','Diet',<Utensils className="w-3.5 h-3.5"/>,[['VEG','Vegetarian'],['NON_VEG','Non-Vegetarian'],['VEGAN','Vegan']]],
            ['physicalActivity','Physical Activity',<Dumbbell className="w-3.5 h-3.5"/>,[['SEDENTARY','Sedentary'],['LIGHT','Light'],['MODERATE','Moderate'],['ACTIVE','Active'],['VERY_ACTIVE','Very Active']]],
            ['stressLevel','Stress Level',<Brain className="w-3.5 h-3.5"/>,[['LOW','Low'],['MEDIUM','Medium'],['HIGH','High']]],
          ] as [keyof Lifestyle, string, React.ReactNode, [string,string][]][]).map(([k, label, icon, opts]) => (
            <div key={k as string}>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">{icon}{label}</label>
              <select value={formData.lifestyle[k] as string} onChange={e => setL(k, e.target.value)} disabled={!isEditing} className={inputCls(!isEditing)}>
                {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5"><Bed className="w-3.5 h-3.5"/>Sleep Hours</label>
            <input type="number" min={0} max={24} value={formData.lifestyle.sleepHours} onChange={e => setL('sleepHours', e.target.value === '' ? '' : parseInt(e.target.value))} disabled={!isEditing} className={inputCls(!isEditing)} />
          </div>
        </div>
      </Section>

      {/* Health Metrics */}
      <Section icon={<HeartPulse className="w-5 h-5 text-red-500" />} title="Current Health Metrics" expanded={expanded.currentHealth} onToggle={() => toggle('currentHealth')} delay={0.2}>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-1">
          {([
            ['height','Height (cm)',<Scale className="w-3.5 h-3.5"/>,'170','1'],
            ['weight','Weight (kg)',<Scale className="w-3.5 h-3.5"/>,'70','0.1'],
            ['bloodPressure','Blood Pressure',<HeartPulse className="w-3.5 h-3.5"/>,'120/80',undefined],
            ['pulse','Pulse (bpm)',<Activity className="w-3.5 h-3.5"/>,'72','1'],
            ['temperature','Temperature (°C)',<Thermometer className="w-3.5 h-3.5"/>,'37.0','0.1'],
            ['bloodSugar','Blood Sugar (mg/dL)',<Droplet className="w-3.5 h-3.5"/>,'100','1'],
          ] as [keyof CurrentHealth, string, React.ReactNode, string, string|undefined][]).map(([k,label,icon,ph,step]) => (
            <div key={k as string}>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">{icon}{label}</label>
              <input type={step ? 'number' : 'text'} step={step} value={formData.currentHealth[k]} onChange={e => setH(k, e.target.value)} disabled={!isEditing} placeholder={ph} className={inputCls(!isEditing)} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">BMI (Auto)</label>
            <div className="relative">
              <input type="text" value={formData.currentHealth.bmi} disabled className={inputCls(true) + ' pr-24'} />
              {formData.currentHealth.bmi && (
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${getBMICategory(formData.currentHealth.bmi).color}`}>
                  {getBMICategory(formData.currentHealth.bmi).text}
                </span>
              )}
            </div>
          </div>
        </div>
      </Section>
    </form>
  );
}
