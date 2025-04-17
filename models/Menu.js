const mongoose = require("mongoose");
const menuSchema = new mongoose.Schema(
  {
    date: { type: String },
    menuType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuType",
      required: true,
    },
    name: { type: String, required: true }, // e.g., “Wednesday Special”
    description: { type: String },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = (conn) => conn.model("Menu", menuSchema);
