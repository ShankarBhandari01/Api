const { Schema, model } = require("mongoose");
//creating the Stock scheme
const stockSchema = new Schema(
  {
    categoryID: {
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
      required: false,
      default: 0,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: { type: String, default: "€" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isDayOfWeek: { type: Boolean, default: false },
    dayOfWeek: { type: Number, default: 0 },
    nameOfWeek: {
      en: { type: String, required: true },
      fi: { type: String, required: true },
    },
    isSpicy: { type: Number, require: false },
    isVagen: { type: Number, require: false },
    isVegetarian: { type: Number, require: false },
  },
  { timestamps: { createdAt: "createdDate", updatedAt: "updated_ts" } }
);

// Food Category Schema
const categorySchema = new Schema({
  name: {
    en: { type: String, required: true, unique: true, trim: true },
    fi: { type: String, required: true, unique: true, trim: true },
  },
  description: {
    en: { type: String, required: true, unique: false, trim: true },
    fi: { type: String, required: true, unique: false, trim: true },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  remarks: {
    en: { type: String, default: "new listed" },
    fi: { type: String, default: "uusi listattu" },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

// Food Category Model
const Category = model("Category", categorySchema);
const Stock = model("Stock", stockSchema);

// Export models for use
module.exports = { Category, Stock };
