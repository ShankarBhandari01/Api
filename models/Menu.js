import { Schema } from "mongoose";

/**
 * Map of weekdays with Finnish translations and numeric values.
 */
const dayMap = {
  Monday: { fi: "Maanantai", number: 1 },
  Tuesday: { fi: "Tiistai", number: 2 },
  Wednesday: { fi: "Keskiviikko", number: 3 },
  Thursday: { fi: "Torstai", number: 4 },
  Friday: { fi: "Perjantai", number: 5 },
  Saturday: { fi: "Lauantai", number: 6 },
  Sunday: { fi: "Sunnuntai", number: 7 },
};

/**
 * Mongoose schema for the daily menu.
 */
const menuSchema = new Schema(
  {
    date: { type: String }, //  ISO date or string

    menuType: {
      type: Schema.Types.ObjectId,
      ref: "MenuType",
      required: true,
    },

    weekday: {
      en: {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
          "",
        ],
        required: false,
      },
      fi: {
        type: String,
        required: false,
      },
      number: {
        type: Number,
        required: false,
        min: 1,
        max: 7,
      },
    },

    name: {
      type: String,
      required: true,
      trim: true, // e.g., “Wednesday Special”
    },

    description: {
      type: String,
      trim: true,
    },

    starters: [
      {
        type: Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    mainCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    desserts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    drinks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    extras: [
      {
        type: Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],

    isActive: { type: Boolean, default: true },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/**
 * Auto-fill `weekday.fi` and `weekday.number` before saving.
 */
menuSchema.pre("save", function () {
  if (this.weekday?.en && dayMap[this.weekday.en]) {
    const { fi, number } = dayMap[this.weekday.en];
    this.weekday.fi = fi;
    this.weekday.number = number;
  }
});

/**
 * Auto-fill `weekday.fi` and `weekday.number` on updates.
 */
function updateWeekdayHook() {
  const update = this.getUpdate();
  if (!update.$set) update.$set = {};

  const weekday = update.weekday?.en;
  if (weekday && dayMap[weekday]) {
    update.weekday.fi = dayMap[weekday].fi;
    update.weekday.number = dayMap[weekday].number;
  }
}

menuSchema.pre("findOneAndUpdate", updateWeekdayHook);
menuSchema.pre("updateOne", updateWeekdayHook);
export default (conn) => conn.model("Menu", menuSchema);
