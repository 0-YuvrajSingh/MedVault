import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../api/notifications';
import type { NotificationItem } from '../api/notifications';

export function useNotifications(role: string) {
  return useQuery<NotificationItem[]>({
    queryKey: [role, 'notifications'],
    queryFn: () => notificationsAPI.getNotifications(role).then(r => r.data),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor', 'notifications'] });
      qc.invalidateQueries({ queryKey: ['patient', 'notifications'] });
    },
  });
}
