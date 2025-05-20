import { Schema, model } from "mongoose";

//  OpeningHourSchema
const OpeningHourSchema = new Schema(
  {
    buffet: {
      days: { type: String, required: true }, // e.g., "Mon - Fri"
      hours: { type: String, required: true }, // e.g., "11 - 15"
    },
    openingHours: {
      monday: { type: String, required: true }, // "11 - 22"
      tuesday: { type: String, required: true },
      wednesday: { type: String, required: true },
      thursday: { type: String, required: true },
      friday: { type: String, required: true }, // "11 - 23"
      saturday: { type: String, required: true }, // "12 - 23"
      sunday: { type: String, required: true }, // "13 - 21"
    },
    closedDates: [
      {
        date: { type: Date, required: true }, // e.g. 2025-12-25
        reason: { type: String, default: "Closed by admin" },
        from: { type: String }, //format: "HH:mm" (e.g. "14:00")
        to: { type: String }, //format: "HH:mm" (e.g. "17:00")
      },
    ],
  },
  { _id: false }
);

const CompanyScheme = new Schema({
  name: String,
  logo: {
    type: Schema.Types.ObjectId,
    ref: "Image",
    default: null,
  },
  address: String,
  phone: String,
  email: String,
  googleMap: String,
  description: {
    en: { type: String, default: "" },
    fi: { type: String, default: "" },
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
  openingHours: OpeningHourSchema,
});
export default (connection) => {
  return {
    CompanyModel: connection.model("Company", CompanyScheme),
  };
};
