import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../api/user';
import type { UserProfile, ChangePasswordData, NotificationPreferences } from '../types';

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ['user', 'profile'],
    queryFn: () => userAPI.getProfile().then(r => r.data),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { fullName: string }) =>
      userAPI.updateProfile(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordData) =>
      userAPI.changePassword(data).then(r => r.data),
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NotificationPreferences) =>
      userAPI.updateNotificationPreferences(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}
