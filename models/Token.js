import { Schema } from "mongoose";
import appconfig from "../config/appconfig.js";

// Define the token schema
const tokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
    deviceInfo: {
      platform: {
        type: String,
        required: true
      },
      deviceId: {
        type: String,
        required: true
      }
    }
  },
  { timestamps: true }
);

// indexing 
tokenSchema.index(
  {
    userId: 1,
    "deviceInfo.platform": 1,
    "deviceInfo.deviceId": 1
  },
  { unique: true } // prevents duplicate tokens per device
);

// Add pre-save hook to handle expiration of the refresh token
tokenSchema.pre("save", function () {
  // Automatically set the expiration for the refresh token based
  if (!this.refreshExpiresAt) {
    const expiredIn = parseInt(appconfig.jwtConfig.refreshTokenExpiresIn.split("d")[0], 10)
    this.refreshExpiresAt = new Date(Date.now() + expiredIn * 24 * 60 * 60 * 1000); // Set refresh token expiry
  }
});

export default (connection) => connection.model("Token", tokenSchema);
