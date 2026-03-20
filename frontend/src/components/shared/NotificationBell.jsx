import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Calendar, FileText, User } from 'lucide-react';
import { notificationAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logger from '../../utils/logger';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const [allRes, countRes] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount()
      ]);

      if (allRes.data) {
        const notifs = allRes.data.data || allRes.data || [];
        setNotifications(notifs.slice(0, 10)); // Show latest 10
      }

      if (countRes.data) {
        setUnreadCount(countRes.data.count || countRes.data.unreadCount || 0);
      }
    } catch (error) {
      logger.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      logger.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      logger.error('Failed to mark all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'APPOINTMENT':
        return <Calendar className="size-5 text-blue-600" />;
      case 'DOCUMENT':
        return <FileText className="size-5 text-purple-600" />;
      case 'ALERT':
        return <AlertCircle className="size-5 text-red-600" />;
      default:
        return <Bell className="size-5 text-gray-600" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <Bell className="size-6 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      disabled={loading}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <X className="size-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Bell className="size-12 mx-auto mb-3 opacity-30" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-slate-900 text-sm">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="size-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <span className="text-xs text-slate-500 mt-1 block">
                              {formatTime(notification.createdAt || notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer intentionally removed: No 'View all notifications' button */}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
