const { Schema, model } = require("mongoose");
//creating the user scheme
const userSchema = new Schema({
  profilePic: {
    type: Schema.Types.ObjectId,
    ref: "Image",
    default: null,
  }, // Reference to Image models
  profileBase64: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: { type: String, enum: ["user", "admin", "manager"], default: "user" }, // Role field
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// the models of the user scheme
module.exports = model("User", userSchema);
