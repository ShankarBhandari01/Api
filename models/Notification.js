const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    }, // For marking notification as seen
    type: {
      type: String,
      enum: ["order", "promotion", "reservation", "reminder", "custom"],
      default: "custom",
    }, // Optional: classify notifications
  },
  { timestamps: true }
);

module.exports = (conn) => conn.model("Notification", notificationSchema);
