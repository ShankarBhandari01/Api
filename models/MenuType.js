// models/MenuType.js
const mongoose = require("mongoose");
const menuTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = (conn) => conn.model("MenuType", menuTypeSchema);
