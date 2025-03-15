const { Schema, model } = require("mongoose");
//creating the Stock scheme
const stockSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category", // Reference to the Category schema
      required: true,
    },
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

// Food Category Schema
const categorySchema = new Schema({
  name: {
    en: { type: String, required: true, unique: true, trim: true },
    fi: { type: String, required: false, unique: true, trim: true },
  },
  description: {
    en: { type: String, required: true, unique: true, trim: true },
    fi: { type: String, required: false, unique: true, trim: true },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Food Category Model
const Category = model("Category", categorySchema);
const Stock = model("Stock", stockSchema);

// Export models for use
module.exports = { Category, Stock };
