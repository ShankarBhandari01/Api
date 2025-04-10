const mongoose = require("mongoose");

// Define the token schema
const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    }, // Access Token
    refreshToken: {
      type: String,
      required: true,
      unique: true,
    }, // Refresh Token
    createdAt: {
      type: Date,
      default: Date.now,
    },
    refreshExpiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Add pre-save hook to handle expiration of the refresh token
tokenSchema.pre("save", function (next) {
  // Automatically set the expiration for the refresh token based
  if (!this.refreshExpiresAt) {
    this.refreshExpiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // Set refresh token expiry to 2 days
  }
  next();
});

module.exports = (connection) => connection.model("Token", tokenSchema);
