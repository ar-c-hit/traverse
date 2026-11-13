const express = require('express');
const router = express.Router();
const {
  getChatMessages,
  sendChatMessage,
  deleteChatMessage,
  togglePin,
  getDirectConversations
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const optionalProtect = (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
};

router.get('/messages', optionalProtect, getChatMessages);
router.get('/conversations', protect, getDirectConversations);
router.post('/messages', protect, sendChatMessage);
router.delete('/messages/:id', protect, deleteChatMessage);
router.put('/messages/:id/pin', protect, adminOnly, togglePin);

module.exports = router;

