import { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    }, // For marking notification as seen
    type: {
      type: String,
      enum: ["order", "promotion", "reservation", "reminder", "custom"],
      default: "custom",
    }, //classify notifications
  },
  { timestamps: true }
);

export default (conn) => conn.model("Notification", notificationSchema);
