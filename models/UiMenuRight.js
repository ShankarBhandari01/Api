// models/UiMenuRight.js
import { Schema } from "mongoose";

const MenuSchema = new Schema({
  name: { type: String, required: true }, // e.g., "Campaigns"
  path: { type: String, required: true }, // e.g., "/campaigns"
  parent: { type: Schema.Types.ObjectId, ref: "UiMenuRight", default: null }, // for submenus
  icon: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

MenuSchema.index({ path: 1 }, { unique: true });
MenuSchema.index({ parent: 1 });

export default (conn) => conn.model("UiMenuRight", MenuSchema);
