const { Schema, model } = require("mongoose");
//creating the Stock scheme
const stockSchema = new Schema(
  {
    image: {
      type: String,
      required: false,
    },
    stockName: {
      en: { type: String, required: true, trim: true },
      fi: { type: String, required: false, trim: true },
    },
    description: {
      en: { type: String, required: true },
      fi: { type: String, required: false },
    },
    remarks: {
      en: { type: String, default: "new listed" },
      fi: { type: String, default: "uusi listattu" },
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: { createdAt: "createdDate", updatedAt: "updated_ts" } }
);

// the model of the Stock scheme
module.exports = model("Stock", stockSchema);
