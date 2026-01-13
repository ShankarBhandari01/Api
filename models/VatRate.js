import { Schema } from "mongoose";

const VatRateSchema = new Schema(
  {
    country: {
      type: String,
      required: true,
      uppercase: true,
      length: 2, // FI, DE, FR
      index: true
    },

    category: {
      type: String,
      required: true,
      enum: ["STANDARD", "REDUCED", "ZERO"],
      index: true
    },

    rate: {
      type: Number, // percentage (e.g. 25.5)
      required: true,
      min: 0
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

//  Prevent overlapping VAT rates for same country + category
VatRateSchema.index(
  {
    country: 1,
    category: 1,
    validFrom: 1,
    validTo: 1
  },
  { unique: true }
);

export default (conn) => conn.model("VatRate", VatRateSchema);