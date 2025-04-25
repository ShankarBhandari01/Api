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
    starters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    mainCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    desserts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    drinks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    extras: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    isActive: { type: Boolean, default: true },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = (conn) => conn.model("Menu", menuSchema);
