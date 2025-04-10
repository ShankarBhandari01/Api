const { Schema, model } = require("mongoose");

const fcmTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  deviceInfo: {
    platform: String, // e.g., 'android' or 'ios'
    deviceId: String, // optional, useful for managing multiple devices
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

fcmTokenSchema.index({ userId: 1, token: 1 }, { unique: true });

module.exports = (connection) => connection.model("FcmToken", fcmTokenSchema);
