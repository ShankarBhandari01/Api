// models/MenuType.js
import { Schema } from "mongoose";
const menuTypeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);
menuTypeSchema.index({ name: 1 });
export default (conn) => conn.model("MenuType", menuTypeSchema);
