const { Schema, model } = require("mongoose");

const OpeningHourSchema = new Schema({
  weekdays: { type: String, required: true },
  buffet: { type: String, required: true },
  weekends: { type: String, required: true },
});

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
    en: { type: String, default: "new listed" },
    fi: { type: String, default: "uusi listattu" },
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
module.exports = (connection) => {
  return {
    CompanyModel: connection.model("Company", CompanyScheme),
  };
};
