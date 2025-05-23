import { Schema, model } from "mongoose";

const userlogSchema = new Schema({
  requestData: {
    type: Object,
  },
  platform: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  email: {
    type: String,
  },
  method: {
    type: String,
  },
  responseTime: {
    type: Number,
  },
  responseData: {
    type: Object,
  },
  statusMsg: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 4, // 4 days
  },
});

userlogSchema.index({ email: 1 });
userlogSchema.index({ timestamp: -1 });
// the models of the UserLoginLog scheme
export default (connection) => connection.model("UserLoginLog", userlogSchema);
