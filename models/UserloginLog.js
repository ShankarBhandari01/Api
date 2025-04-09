const { Schema, model } = require("mongoose");

const userlogSchema = new Schema({
  requestData:{
    type:Object
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
  statusMsg: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// the models of the UserLoginLog scheme
module.exports = model("UserLoginLog", userlogSchema);
