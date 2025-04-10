const { Schema, model } = require("mongoose");

const subscriberSchema = new Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});

module.exports = (connection) =>
  connection.model("Subscriber", subscriberSchema);
