import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const { socket } = useChat();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Fetch notifications from server when authenticated
  const fetchNotifications = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        const serverList = Array.isArray(data.notifications) ? data.notifications : [];
        setNotifications(serverList);
        setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : serverList.filter(n => !n.read).length);
      }
    } catch (err) {
      console.warn('[Notifications] Error fetching notifications:', err.message);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Dispatch a real-time notification locally and trigger toast
  const triggerNotification = useCallback((notif) => {
    if (!notif || !isAuthenticated) return;

    const notifObj = {
      _id: notif._id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      recipient: notif.recipient || (user?._id ? user._id.toString() : 'current'),
      sender: notif.sender || null,
      type: notif.type || 'system',
      title: notif.title || 'Notification',
      message: notif.message || '',
      link: notif.link || '',
      read: false,
      metadata: notif.metadata || {},
      createdAt: notif.createdAt || new Date().toISOString()
    };

    setNotifications((prev) => {
      if (prev.some((n) => n._id === notifObj._id)) return prev;
      return [notifObj, ...prev];
    });

    setUnreadCount((prev) => prev + 1);

    // Trigger subtle floating toast alert
    setToastNotification({
      id: notifObj._id,
      title: notifObj.title,
      message: notifObj.message,
      type: notifObj.type,
      avatar: notifObj.sender?.avatar,
      senderName: notifObj.sender?.name,
      link: notifObj.link
    });

    // Auto dismiss toast after 5 seconds
    setTimeout(() => {
      setToastNotification((current) => (current?.id === notifObj._id ? null : current));
    }, 5000);
  }, [user, isAuthenticated]);

  // Simulate incoming live notification (for testing or interactive demonstration)
  const simulateNotification = useCallback(() => {
    if (!isAuthenticated) return;

    const demoEvents = [
      {
        sender: {
          _id: '670000000000000000000003',
          name: 'Sofia Morales',
          username: 'sofia',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
          badge: 'EXPLORER'
        },
        type: 'like_trip',
        title: 'Trip Liked! ❤️',
        message: 'Sofia Morales liked your Tokyo to Kyoto Cherry Blossom itinerary!',
        link: '/planner'
      },
      {
        sender: {
          _id: '670000000000000000000004',
          name: 'Liam Vance',
          username: 'liam',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
          badge: 'EXPLORER'
        },
        type: 'join_trip',
        title: 'New Travel Buddy! 🎒',
        message: 'Liam Vance joined your upcoming Ladakh & Pangong Tso expedition!',
        link: '/planner'
      },
      {
        sender: {
          _id: '670000000000000000000001',
          name: 'Archit (Super Admin)',
          username: 'archit',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          badge: 'ADMIN'
        },
        type: 'follow',
        title: 'New Follower! 👤',
        message: 'Archit (Super Admin) followed you! Connect and view shared destinations.',
        link: '/socials'
      },
      {
        sender: {
          _id: '670000000000000000000003',
          name: 'Sofia Morales',
          username: 'sofia',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
          badge: 'EXPLORER'
        },
        type: 'message',
        title: 'New Direct Message 💬',
        message: 'Hey! Are you planning to visit Pangong Lake at sunrise or sunset?',
        link: '/socials'
      }
    ];

    const randomEvent = demoEvents[Math.floor(Math.random() * demoEvents.length)];
    triggerNotification(randomEvent);
  }, [isAuthenticated, triggerNotification]);

  // Real-time socket listener for new notifications
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleNewNotification = (notif) => {
      if (!notif) return;
      triggerNotification(notif);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, isAuthenticated, triggerNotification]);

  // Mark a single notification as read
  const markAsRead = async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    if (!token) return;

    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.warn('Error marking notification as read on server:', err.message);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    if (!token) return;

    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.warn('Error marking all notifications as read on server:', err.message);
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    const target = notifications.find((n) => n._id === id);
    if (target && !target.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setNotifications((prev) => prev.filter((n) => n._id !== id));

    if (!token) return;

    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.warn('Error deleting notification on server:', err.message);
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);

    if (!token) return;

    try {
      await fetch('/api/notifications/clear-all', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.warn('Error clearing all notifications on server:', err.message);
    }
  };

  const dismissToast = () => setToastNotification(null);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        triggerNotification,
        simulateNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        toastNotification,
        dismissToast
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
