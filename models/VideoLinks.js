import { Schema } from "mongoose";
const videoLinkSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      match: /^https?:\/\/.+/,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

videoLinkSchema.index({ title: "text", description: "text" });

export default (conn) => conn.model("VideoLink", videoLinkSchema);
