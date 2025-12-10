import { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
const CampaingnScheme = new Schema({
  image: {
    type: Schema.Types.ObjectId,
    ref: "Image",
    default: null,
  },
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
    enum: ["Active", "Completed", "Expired", "Issue", "Disable"],
    default: "Disable",
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
  uuid: { type: String, default: uuidv4 },
});
// Add pre hooks to auto-update `updated_at` before updates
const autoUpdateTimestamp = function (next) {
  this.set({ updated_at: new Date() });
  next();
};

CampaingnScheme.pre("findOneAndUpdate", autoUpdateTimestamp);
CampaingnScheme.pre("updateOne", autoUpdateTimestamp);
CampaingnScheme.pre("updateMany", autoUpdateTimestamp);

export default (connection) => connection.model("Campaign", CampaingnScheme);
