// models/Menu.js
const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Campaigns"
  path: { type: String, required: true }, // e.g., "/campaigns"
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", default: null },
  icon: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

MenuSchema.index({ path: 1 }, { unique: true });
MenuSchema.index({ parent: 1 });

module.exports = (conn) => conn.model("Menu", MenuSchema);
