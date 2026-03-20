import { useEffect, useState } from "react";
import { notificationAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import config from "../utils/config";
import logger from "../utils/logger";

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let intervalId;

    // Poll notifications from DB for ADMIN and DOCTOR users
    if (user?.id && (user.role === "ADMIN" || user.role === "DOCTOR")) {
      fetchNotifications();
      fetchUnreadCount();
      intervalId = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, config.notificationPollMs);

      return () => {
        clearInterval(intervalId);
      };
    }

    return undefined;
  }, [user?.id, user?.role]);

  const fetchNotifications = async () => {
    if (!user?.id || (user.role !== "ADMIN" && user.role !== "DOCTOR")) return;

    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      logger.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id || (user.role !== "ADMIN" && user.role !== "DOCTOR")) return;

    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.data);
      }
    } catch (error) {
      logger.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await notificationAPI.markAsRead(notificationId);
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      logger.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const response = await notificationAPI.markAllAsRead();
      if (response.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      logger.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await notificationAPI.delete(notificationId);
      if (response.data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        const wasUnread = notifications.find(
          (n) => n.id === notificationId && !n.read
        );
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      logger.error("Error deleting notification:", error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
};
