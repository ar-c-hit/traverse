const Store = require('./store');

/**
 * Creates a notification and emits it in real-time via Socket.io
 * @param {Object} options
 * @param {string} options.recipient - Target user ID
 * @param {Object|null} options.sender - Sender user info { _id, name, username, avatar, badge }
 * @param {'follow'|'like_trip'|'join_trip'|'message'|'system'} options.type - Notification type
 * @param {string} options.title - Header / summary
 * @param {string} options.message - Descriptive text
 * @param {string} [options.link] - Client-side destination path
 * @param {Object} [options.metadata] - Extra metadata (e.g. tripId, senderId)
 * @param {Object} [io] - Socket.io instance
 */
const createNotification = async (options, io) => {
  try {
    const { recipient, sender, type, title, message, link, metadata } = options;
    if (!recipient) return null;

    const notif = await Store.notifications.create({
      recipient: recipient.toString(),
      sender: sender ? {
        _id: sender._id ? sender._id.toString() : undefined,
        name: sender.name,
        username: sender.username,
        avatar: sender.avatar,
        badge: sender.badge
      } : null,
      type: type || 'system',
      title: title || 'Notification',
      message: message || '',
      link: link || '',
      read: false,
      metadata: metadata || {},
      createdAt: new Date()
    });

    if (io) {
      const room = `user_${recipient.toString()}`;
      io.to(room).emit('new_notification', notif);
    }

    return notif;
  } catch (error) {
    console.error('[Notification System] Error creating notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };

