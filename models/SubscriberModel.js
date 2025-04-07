const { Schema, model } = require("mongoose");

const subscriberSchema = new Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});

const Subscriber = model("Subscriber", subscriberSchema);

module.exports = { Subscriber };
