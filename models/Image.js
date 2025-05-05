import { Schema, model } from "mongoose";

const ImageSchema = new Schema({
  url: {
    type: String,
    required: function () {
      return !this.imageData;
    },
  },
  filename: { type: String, required: true, index: true }, 
  contentType: { type: String, required: true }, 
  imageData: {
    type: Buffer,
    required: function () {
      return !this.url;
    }, 
    required: true,
  }, // Binary image data
  uploadedAt: { type: Date, default: Date.now, index: true }, // Timestamp
});

export default (connection) => connection.model("Image", ImageSchema);
