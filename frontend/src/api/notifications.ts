import api from './axios';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}

export const notificationsAPI = {
  getNotifications: (role: string) => api.get<NotificationItem[]>(`/${role}/notifications`),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
};
