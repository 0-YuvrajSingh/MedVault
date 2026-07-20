import api from './axios';
import type { UserProfile, ChangePasswordData, NotificationPreferences } from '../types';

export const userAPI = {
  getProfile: () => api.get<UserProfile>('/user/profile'),
  updateProfile: (data: { fullName: string }) => api.patch<UserProfile>('/user/profile', data),
  changePassword: (data: ChangePasswordData) => api.post('/user/change-password', data),
  updateNotificationPreferences: (data: NotificationPreferences) =>
    api.patch<UserProfile>('/user/notifications', data),
};
