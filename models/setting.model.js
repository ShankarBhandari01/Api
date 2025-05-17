import { Schema } from "mongoose";

const settingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      // Example: 'notifications.email', 'featureX.enabled'
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
      // Can be Boolean, String, Number, Object etc.
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // If null, it's a global setting
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true, // Determines if the setting is currently active
    },
  },
  { timestamps: true }
);

settingSchema.index({ key: 1, userId: 1 }, { unique: true }); // Unique per user or globally

export default (conn) => conn.model("Setting", settingSchema);
