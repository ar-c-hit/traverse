const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
      index: true
    },
    sender: {
      _id: { type: String },
      name: { type: String },
      username: { type: String },
      avatar: { type: String },
      badge: { type: String }
    },
    type: {
      type: String,
      enum: ['follow', 'like_trip', 'join_trip', 'message', 'system'],
      default: 'system'
    },
    title: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    link: { 
      type: String, 
      default: '' 
    },
    read: { 
      type: Boolean, 
      default: false 
    },
    metadata: { 
      type: mongoose.Schema.Types.Mixed, 
      default: {} 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

