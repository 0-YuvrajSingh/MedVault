import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { User, Shield, Bell, Palette, MonitorSmartphone, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile, useUpdateProfile, useChangePassword, useUpdateNotificationPreferences } from '../../hooks/useUserQuery';

const SettingsPage: React.FC = () => {
  const { fullName, role } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const updateNotifications = useUpdateNotificationPreferences();

  const [profileName, setProfileName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (profile) {
      setProfileName(profile.fullName || '');
      setEmailNotifications(profile.emailNotifications ?? true);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ fullName: profileName });
      setProfileSuccess('Profile updated successfully');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch {
      setProfileSuccess('');
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
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
      setPasswordSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Failed to update password');
    }
  };

  const handleToggleNotifications = async () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    try {
      await updateNotifications.mutateAsync({ emailNotifications: newValue });
    } catch {
      setEmailNotifications(!newValue);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'sessions', label: 'Sessions', icon: <MonitorSmartphone className="w-4 h-4" /> },
    { id: 'history', label: 'Access History', icon: <Clock className="w-4 h-4" /> },
  ];

  if (profileLoading) {
    return (
      <div className="space-y-8 animate-fade-in pb-12">
        <div className="page-header flex flex-col mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Settings</h1>
          <p className="text-slate-500">Manage your account preferences, security, and workspace settings.</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="page-header flex flex-col mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Settings</h1>
        <p className="text-slate-500">Manage your account preferences, security, and workspace settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Card className="w-full md:w-64 shrink-0 p-2 overflow-hidden sticky top-24">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
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
            <Card className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Profile Settings</h2>
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold shadow-inner">
                  {profile?.fullName?.[0] || fullName?.[0] || 'U'}
                </div>
                <div>
                  <button className="btn-secondary btn-sm mb-2" type="button">Upload Photo</button>
                  <p className="text-xs text-slate-500">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>
              {profileSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">{profileSuccess}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="input"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                  <input
                    type="text"
                    className="input bg-slate-100 text-slate-500 cursor-not-allowed"
                    disabled
                    value={profile?.email || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                  <input
                    type="text"
                    className="input bg-slate-100 text-slate-500 cursor-not-allowed"
                    disabled
                    defaultValue={role?.replace('ROLE_', '')}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  className="btn-primary"
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Security & Password</h2>
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">{passwordSuccess}</div>
              )}
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    className="input"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <input
                    type="password"
                    className="input"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="input"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  className="btn-primary w-full mt-4"
                  onClick={handleUpdatePassword}
                  disabled={changePassword.isPending}
                >
                  {changePassword.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Email Notifications</h3>
                    <p className="text-sm text-slate-500">Receive alerts via email for important updates.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleNotifications}
                    className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${
                      emailNotifications ? 'bg-blue-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${
                        emailNotifications ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">System Alerts</h3>
                    <p className="text-sm text-slate-500">In-app notifications for tasks and assignments.</p>
                  </div>
                  <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer shadow-inner">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {['appearance', 'sessions', 'history'].includes(activeTab) && (
            <Card className="p-16 flex flex-col items-center justify-center text-center border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                {activeTab === 'appearance' ? <Palette className="w-8 h-8" /> : activeTab === 'sessions' ? <MonitorSmartphone className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 capitalize">{activeTab} Settings</h2>
              <p className="text-slate-500 text-sm">This section is currently under development.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
