import { Schema } from "mongoose";

const VatCategorySchema = new Schema(
  {
    category: {
      type: String,
      enum: ["STANDARD", "REDUCED", "ZERO"],
      required: true
    },

    rate: {
      type: Number, // percentage (e.g. 25.5)
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const VatRateSchema = new Schema(
  {
    country: {
      type: String,
      required: true,
      uppercase: true,
      length: 2, // FI, DE, FR
      index: true
    },

    vatRates: {
      type: [VatCategorySchema],
      required: true,
      validate: {
        validator: function (rates) {
          const categories = rates.map(r => r.category);
          return categories.length === new Set(categories).size;
        },
        message: "Duplicate VAT categories are not allowed"
      }
    },

    validFrom: {
      type: Date,
      required: true,
      index: true
    },

    validTo: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// One active VAT config per country per period
VatRateSchema.index(
  { country: 1, validFrom: 1, validTo: 1 },
  { unique: true }
);

VatRateSchema.pre("deleteOne", function () {
  throw new Error("VAT configurations must not be deleted");
});

export default (conn) => conn.model("VatRate", VatRateSchema);
