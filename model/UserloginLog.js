const { Schema, model } = require("mongoose");

const userlogSchema = new Schema({
  requestData:{
    type:Object
  },
  platform: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  method: {
    type: String,
  },
  responseTime: {
    type: Number,
  },
  statusMsg: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// the model of the UserLoginLog scheme
module.exports = model("UserLoginLog", userlogSchema);
