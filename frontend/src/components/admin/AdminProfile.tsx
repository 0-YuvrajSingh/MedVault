import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Shield, Save, Edit2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/utils/toast';

interface ProfileForm {
  name:    string;
  email:   string;
  phone:   string;
  address: string;
}

export default function AdminProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    name:    user?.name    ?? '',
    email:   user?.email   ?? '',
    phone:   (user as any)?.phone   ?? '',
    address: (user as any)?.address ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to adminAPI.updateProfile
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputCls = (editing: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${!editing ? 'opacity-60 cursor-not-allowed' : ''}`;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Manage your account information</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 p-2.5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
          <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
            <Shield className="w-5 h-5 text-orange-600" />
          </div>
          <div className="pr-1">
            <p className="text-xs text-neutral-500">Role</p>
            <p className="text-sm font-bold text-orange-600">Administrator</p>
          </div>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Profile header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {user?.name?.charAt(0) ?? 'A'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{user?.name ?? 'Admin User'}</h2>
                  <p className="text-sm text-neutral-500">{user?.email ?? 'admin@medvault.com'}</p>
                </div>
              </div>
              {!isEditing
                ? (
                  <button type="button" onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors">
                    <Edit2 size={15} /> Edit Profile
                  </button>
                ) : (
                  <button type="button" onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-neutral-300 transition-colors">
                    <X size={15} /> Cancel
                  </button>
                )
              }
            </div>

            {/* Fields */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {([
                { label: 'Full Name',     icon: <User size={14} />,   name: 'name',    type: 'text' },
                { label: 'Email Address', icon: <Mail size={14} />,   name: 'email',   type: 'email' },
                { label: 'Phone Number',  icon: <Phone size={14} />,  name: 'phone',   type: 'tel',  placeholder: '+91 …' },
                { label: 'Address',       icon: <MapPin size={14} />, name: 'address', type: 'text', placeholder: 'Enter address' },
              ] as const).map(f => (
                <div key={f.name}>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                    {f.icon} {f.label}
                  </label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder={'placeholder' in f ? f.placeholder : undefined}
                    className={inputCls(isEditing)}
                  />
                </div>
              ))}
            </div>

            {/* Account info */}
            <div className="px-6 pb-6 border-t border-neutral-200 dark:border-neutral-800 pt-5">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { icon: <Calendar size={18} className="text-orange-500" />, label: 'Member Since', value: (user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'N/A', bg: 'bg-orange-50 dark:bg-orange-950/20' },
                  { icon: <Shield size={18} className="text-green-500" />,    label: 'Account Status', value: 'Active',  bg: 'bg-green-50 dark:bg-green-950/20' },
                ]).map(i => (
                  <div key={i.label} className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                    <div className={`p-2 rounded-lg ${i.bg}`}>{i.icon}</div>
                    <div>
                      <p className="text-xs text-neutral-500">{i.label}</p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{i.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save */}
            {isEditing && (
              <div className="flex justify-end px-6 pb-6">
                <button type="submit" className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                  <Save size={15} /> Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
