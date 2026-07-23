import React from 'react';
import { Card } from '../../components/ui/Card';
import { Bell, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications, useMarkNotificationRead } from '../../hooks/useNotificationsQuery';
import type { NotificationItem } from '../../api/notifications';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const typeConfig: Record<string, { icon: React.ReactNode; badge: 'info' | 'success' | 'warning' | 'danger' }> = {
  INFO: { icon: <Info className="w-5 h-5" />, badge: 'info' },
  SUCCESS: { icon: <CheckCircle className="w-5 h-5" />, badge: 'success' },
  WARNING: { icon: <AlertTriangle className="w-5 h-5" />, badge: 'warning' },
  ERROR: { icon: <XCircle className="w-5 h-5" />, badge: 'danger' },
};

const bgColors: Record<string, string> = {
  INFO: 'bg-blue-50 text-blue-600',
  SUCCESS: 'bg-green-50 text-green-600',
  WARNING: 'bg-amber-50 text-amber-600',
  ERROR: 'bg-red-50 text-red-600',
};

const NotificationCard: React.FC<{ notification: NotificationItem; onMarkRead: (id: string) => void }> = ({ notification, onMarkRead }) => {
  const notifType = notification.type || 'INFO';
  const config = typeConfig[notifType] || typeConfig.INFO;

  return (
    <Card className={`p-4 ${!notification.read ? 'border-primary-200 bg-primary-50/30' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${bgColors[notifType] || bgColors.INFO}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              {notification.title}
            </h3>
            {!notification.read && (
              <Button variant="ghost" size="sm" onClick={() => onMarkRead(notification.id)}>Mark read</Button>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-0.5">{notification.message}</p>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </Card>
  );
};

const PatientNotificationsPage: React.FC = () => {
  const { data: notifications = [], isLoading, isError } = useNotifications('patient');
  const markRead = useMarkNotificationRead();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="space-y-6 pb-12">
        <div className="page-header">
          <h1>Notifications</h1>
          <p>Unable to load notifications</p>
        </div>
        <Card>
          <EmptyState
            icon={<Bell className="w-8 h-8 text-danger-500" />}
            title="Failed to load notifications"
            description="An error occurred while fetching your notifications. Please try again."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="page-header">
        <h1>Notifications</h1>
        <p>
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
            : 'Updates on your medical records and appointments'}
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bell className="w-8 h-8" />}
            title="All Caught Up"
            description="You have no notifications at this time."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <NotificationCard key={n.id} notification={n} onMarkRead={(id) => markRead.mutate(id)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientNotificationsPage;
