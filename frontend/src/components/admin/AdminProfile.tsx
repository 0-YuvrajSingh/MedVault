// @ts-nocheck
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Shield, Save, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Navbar';
import AdminSidebar from './AdminSidebar';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { showToast } from '../../utils/toast';

export default function AdminProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to update profile
    showToast('Profile updated successfully', 'success');
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-neutral-900">
      <Navbar />
      <AdminSidebar />
      
      <main className="pl-64 pt-24 p-8 transition-all duration-300">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Profile Settings
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                Manage your account information
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-2 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
              <div className="p-2 bg-admin-50 dark:bg-admin-900/20 rounded-xl">
                <Shield className="w-5 h-5 text-admin-500" />
              </div>
              <div className="pr-2">
                <p className="text-xs text-neutral-500">Role</p>
                <p className="text-sm font-bold text-admin-600">Administrator</p>
              </div>
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-admin-500 to-admin-600 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {user?.name || 'Admin User'}
                      </h2>
                      <p className="text-neutral-500 dark:text-neutral-400">
                        {user?.email || 'admin@medvault.com'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={isEditing ? 'ghost' : 'primary'}
                    role="admin"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>Cancel</>
                    ) : (
                      <>
                        <Edit2 size={16} />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Full Name
                      </div>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-admin-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        Email Address
                      </div>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-admin-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        Phone Number
                      </div>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-admin-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        Address
                      </div>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter address"
                      className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-admin-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Account Info */}
                <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                      <div className="p-2 bg-admin-50 dark:bg-admin-900/20 rounded-lg">
                        <Calendar size={20} className="text-admin-500" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Member Since</p>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Shield size={20} className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Account Status</p>
                        <p className="text-sm font-semibold text-green-600">Active</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end pt-6 border-t border-neutral-200 dark:border-neutral-700">
                    <Button type="submit" variant="primary" role="admin">
                      <Save size={16} />
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
