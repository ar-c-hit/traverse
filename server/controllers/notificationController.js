const Store = require('../utils/store');
const { createNotification } = require('../utils/notify');

// @desc Get all notifications for current user
// @route GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    let notifications = await Store.notifications.find({ recipient: userId });

    // If current user has 0 notifications, seed welcoming active notifications
    if (notifications.length === 0) {
      await Store.notifications.create({
        recipient: userId,
        sender: {
          _id: '670000000000000000000003',
          name: 'Sofia Morales',
          username: 'sofia',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
          badge: 'EXPLORER'
        },
        type: 'follow',
        title: 'New Follower! 👤',
        message: 'Sofia Morales started following you! Follow back to become mutual friends and chat.',
        link: '/profile/670000000000000000000003',
        read: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000)
      });

      await Store.notifications.create({
        recipient: userId,
        sender: {
          _id: '670000000000000000000001',
          name: 'Archit (Super Admin)',
          username: 'archit',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
          badge: 'ADMIN'
        },
        type: 'like_trip',
        title: 'Trip Itinerary Liked ❤️',
        message: 'Archit (Super Admin) liked your travel plans and field coordinates!',
        link: '/planner',
        read: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000)
      });

      await Store.notifications.create({
        recipient: userId,
        sender: null,
        type: 'system',
        title: 'Welcome to Traverse! 🧭',
        message: 'Explore 18+ verified field coordinates, match with travelers on the same dates, and share daily journals.',
        link: '/explore',
        read: false,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000)
      });

      notifications = await Store.notifications.find({ recipient: userId });
    }

    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// @desc Mark a single notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const notif = await Store.notifications.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (notif.recipient.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to notification' });
    }

    const updated = await Store.notifications.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true, notification: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

// @desc Mark all notifications as read for current user
// @route PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    await Store.notifications.updateMany({ recipient: userId, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
  }
};

// @desc Delete a single notification
// @route DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const notif = await Store.notifications.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (notif.recipient.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Store.notifications.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

// @desc Clear all notifications for current user
// @route DELETE /api/notifications/clear-all
const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    await Store.notifications.deleteMany({ recipient: userId });
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing notifications', error: error.message });
  }
};

// @desc Create a simulated test notification for current user
// @route POST /api/notifications/test
const createTestNotification = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const io = req.app?.get('io');
    const notif = await createNotification({
      recipient: userId,
      sender: {
        _id: '670000000000000000000003',
        name: 'Sofia Morales',
        username: 'sofia',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        badge: 'EXPLORER'
      },
      type: 'like_trip',
      title: 'Trip Itinerary Liked! ❤️',
      message: 'Sofia Morales liked your upcoming Tokyo to Kyoto cherry blossom trip!',
      link: '/planner',
      metadata: { simulated: true }
    }, io);

    res.json({ success: true, notification: notif });
  } catch (error) {
    res.status(500).json({ message: 'Error creating test notification', error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createTestNotification
};

