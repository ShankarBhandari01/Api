// models/Role.js
import { Schema } from "mongoose";

const RoleSchema = new Schema({
  name: { type: String, required: true, unique: true }, // role name
  description: { type: String },
  menuRights: [
    {
      menu: {
        type: Schema.Types.ObjectId,
        ref: "UiMenuRight",
        required: true,
      },
      permissions: [{ type: String }], // e.g., ['read', 'write']
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RoleSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});
export default (conn) => conn.model("Role", RoleSchema);
