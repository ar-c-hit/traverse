const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      default: 'general'
    },
    recipientId: { type: String, default: null },
    isDirect: { type: Boolean, default: false },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String },
    senderRole: { type: String, default: 'user' },
    message: { type: String, required: true },
    likes: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

