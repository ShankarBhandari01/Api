import { Schema, model } from "mongoose";

const fcmTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  deviceInfo: {
    platform: String, // e.g., 'android' or 'ios'
    deviceId: String, // useful for managing multiple devices
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

fcmTokenSchema.index({ userId: 1, token: 1 }, { unique: true });

export default (connection) =>  connection.model("FcmToken", fcmTokenSchema);
