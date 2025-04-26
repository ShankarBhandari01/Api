const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    imageUrl: { 
      type: String 
    }, // Optional, if you want to send an image along
    data: {
      type: Object
    }, // Extra payload (like deep link info, etc.)
    isRead: { 
      type: Boolean, 
      default: false 
    }, // For marking notification as seen
    type: {
      type: String,
      enum: ['order', 'promotion', 'system', 'reminder', 'custom'], 
      default: 'custom'
    }, // Optional: classify notifications
  },
  { timestamps: true }
);

module.exports = (conn) => conn.model('Notification', notificationSchema);
