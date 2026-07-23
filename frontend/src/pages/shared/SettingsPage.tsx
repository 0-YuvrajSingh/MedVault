import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile, useUpdateProfile, useChangePassword } from '../../hooks/useUserQuery';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { showToast } from '../../components/ui/Toast';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const SettingsPage: React.FC = () => {
  const { fullName, role, updateFullName } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [profileName, setProfileName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (profile) {
      setProfileName(profile.fullName || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ fullName: profileName });
      updateFullName(profileName.trim());
      showToast('success', 'Profile updated', 'Your profile has been saved successfully.');
    } catch {
      showToast('error', 'Update failed', 'Could not update profile.');
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      showToast('success', 'Password updated', 'Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Failed to update password');
    }
  };


  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  ];

  if (profileLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account preferences, security, and workspace settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full md:w-52 shrink-0 p-2 sticky top-24">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </Card>

        <div className="flex-1 min-w-0 w-full space-y-6">
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-5">Profile Settings</h2>
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold">
                  {profile?.fullName?.[0] || fullName?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{fullName || 'User'}</p>
                  <p className="text-xs text-slate-400">{profile?.email || ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                />
                <Input
                  label="Email"
                  value={profile?.email || ''}
                  disabled
                />
                <Input
                  label="Role"
                  value={role?.replace('ROLE_', '') || ''}
                  disabled
                />
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveProfile} loading={updateProfile.isPending}>
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-5">Security & Password</h2>
              {passwordError && (
                <div className="mb-4 p-3 bg-danger-50 border border-danger-100 rounded-lg text-sm text-danger-700">{passwordError}</div>
              )}
              <div className="space-y-4 max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                <Button onClick={handleUpdatePassword} loading={changePassword.isPending}>
                  Update Password
                </Button>
              </div>
            </Card>
          )}


        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
