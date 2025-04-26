// models/MenuType.js
const mongoose = require("mongoose");
const menuTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);
menuTypeSchema.index({ name: 1 });
module.exports = (conn) => conn.model("MenuType", menuTypeSchema);
