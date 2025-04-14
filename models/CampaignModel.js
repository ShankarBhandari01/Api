const { object } = require("joi");
const { Schema } = require("mongoose");
const CampaingnScheme = new Schema({
  name: {
    en: { type: String, default: "new listed" },
    fi: { type: String, default: "uusi listattu" },
  },
  message: {
    en: { type: String, default: "new listed" },
    fi: { type: String, default: "uusi listattu" },
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  offer_terms: {
    en: { type: String, default: "new listed" },
    fi: { type: String, default: "uusi listattu" },
  },
  status: {
    type: String,
    enum: ["Active", "Completed", "Expired", "Issue"],
    default: "Active",
  },
  issueMessage: { type: Object },
  offer_details: {
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
});
module.exports = (connection) => connection.model("Campaign", CampaingnScheme);
