const { Schema, model } = require("mongoose");

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
  },
});

userlogSchema.index({ email: 1 });
userlogSchema.index({ timestamp: -1 });
// the models of the UserLoginLog scheme
module.exports = (connection) =>
  connection.model("UserLoginLog", userlogSchema);
