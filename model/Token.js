const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true }, // Access Token
  refreshToken: { type: String, required: true, unique: true }, // Refresh Token
  createdAt: { type: Date, default: Date.now, expires: "1h" }, // Auto-delete access tokens
  refreshExpiresAt: { type: Date, required: true } // Custom expiry for refresh token
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
