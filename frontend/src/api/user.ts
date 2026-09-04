import api from './axios';
import type { UserProfile, ChangePasswordData } from '../types';

export const userAPI = {
  getProfile: () => api.get<UserProfile>('/user/profile'),
  updateProfile: (data: { fullName: string }) => api.patch<UserProfile>('/user/profile', data),
  changePassword: (data: ChangePasswordData) => api.post('/user/change-password', data),
};
