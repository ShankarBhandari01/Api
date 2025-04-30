const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    date: { type: String },
    menuType: {
      type: mongoose.Schema.Types.ObjectId,
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
        ],
        required: true,
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
    name: { type: String, required: true, trim: true}, // e.g., “Wednesday Special”
    description: { type: String, trim: true},
    starters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    mainCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    desserts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    drinks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    extras: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stock",
      },
    ],
    isActive: { type: Boolean, default: true },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Pre-save hook to auto-fill `fi` and `number` based on `en` value
menuSchema.pre("save", function (next) {
  const dayMap = {
    Monday: { fi: "Maanantai", number: 1 },
    Tuesday: { fi: "Tiistai", number: 2 },
    Wednesday: { fi: "Keskiviikko", number: 3 },
    Thursday: { fi: "Torstai", number: 4 },
    Friday: { fi: "Perjantai", number: 5 },
    Saturday: { fi: "Lauantai", number: 6 },
    Sunday: { fi: "Sunnuntai", number: 7 },
  };

  // Automatically set `fi` and `number` based on `en`
  if (this.weekday?.en && dayMap[this.weekday.en]) {
    this.weekday.fi = dayMap[this.weekday.en].fi;
    this.weekday.number = dayMap[this.weekday.en].number;
  }

  next();
});
// Pre-hook for findByIdAndUpdate to auto-fill `fi` and `number` when updating
menuSchema.pre("findByIdAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update?.$set?.weekday?.en) {
    const dayMap = {
      Monday: { fi: "Maanantai", number: 1 },
      Tuesday: { fi: "Tiistai", number: 2 },
      Wednesday: { fi: "Keskiviikko", number: 3 },
      Thursday: { fi: "Torstai", number: 4 },
      Friday: { fi: "Perjantai", number: 5 },
      Saturday: { fi: "Lauantai", number: 6 },
      Sunday: { fi: "Sunnuntai", number: 7 },
    };

    // If the `en` value is provided, we auto-map `fi` and `number`
    const weekday = update.$set.weekday.en;
    if (dayMap[weekday]) {
      update.$set["weekday.fi"] = dayMap[weekday].fi;
      update.$set["weekday.number"] = dayMap[weekday].number;
    }
  }

  next();
});
module.exports = (conn) => conn.model("Menu", menuSchema);
