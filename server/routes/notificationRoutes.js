const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createTestNotification
} = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.post('/test', protect, createTestNotification);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/clear-all', protect, clearAllNotifications);
router.delete('/:id', protect, deleteNotification);

module.exports = router;

