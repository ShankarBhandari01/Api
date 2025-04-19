// models/Role.js
const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // role name
  description: { type: String },
  menuRights: [
    {
      menu: {
        type: mongoose.Schema.Types.ObjectId,
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
module.exports = (conn) => conn.model("Role", RoleSchema);
