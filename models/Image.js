const { Schema, model } = require("mongoose");

const ImageSchema = new Schema({
  url: {
    type: String,
    required: function () {
      return !this.imageData;
    },
  }, // Required if no imageData
  filename: { type: String, required: true, index: true }, // Original file name
  contentType: { type: String, required: true }, // Image MIME type (e.g., image/png)
  imageData: {
    type: Buffer,
    required: function () {
      return !this.url;
    }, // Required only if url is missing
    required: true,
  }, // Binary image data
  uploadedAt: { type: Date, default: Date.now, index: true }, // Timestamp
});

module.exports = (connection) => connection.model("Image", ImageSchema);
